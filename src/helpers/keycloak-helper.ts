import KcAdminClient from '@keycloak/keycloak-admin-client';
import KeycloakConnect, {Keycloak} from "keycloak-connect";
import Logger from "./logger";
import {Issuer} from 'openid-client';
import {IncomingMessage} from "http";
import {RequestHandler} from "express";
import environment from "../environment";
import session, {MemoryStore} from "express-session";
import PasswordGenerator from "generate-password"
import {Credentials} from "@keycloak/keycloak-admin-client/lib/utils/auth";
import ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import {ForbiddenException, InternalServerErrorException, UnauthorizedException} from "../exceptions/http-exceptions";

class KcHelper {
    private readonly keycloak: Keycloak; //used for router protection
    private readonly memoryStore: MemoryStore;
    private readonly kcAdminClient: KcAdminClient; //used for internal API request with Keycloak
    private readonly config = environment.keycloakConfig;

    constructor() {
        const kcConfig: any = {
            clientId: this.config.clientId,
            bearerOnly: true, // set false if you want the user to be redirected to the login page
            serverUrl: this.config.baseUrl,
            realm: this.config.realmName,
            credentials: {
                secret: this.config.clientSecret
            }
        };

        this.memoryStore = new MemoryStore();
        this.keycloak = new KeycloakConnect({store: this.memoryStore}, kcConfig);
        this.keycloak.accessDenied = (req, _) => {
            // if token is not set or has expired throw UnauthorizedException,
            // otherwise you are accessing a resource that you are not authorized to access (ForbiddenException)
            // @ts-ignore (kauth)
            throw req.headers.authorization && req.kauth.grant ? new ForbiddenException() : new UnauthorizedException();
        };

        this.kcAdminClient = new KcAdminClient({
            baseUrl: this.config.baseUrl,
            realmName: this.config.realmName
        });
    }

    /**
     * Return the session can used with keycloak-connect
     */
    public get session(): RequestHandler {
        return session({
            secret: PasswordGenerator.generate(),
            resave: false,
            saveUninitialized: true,
            store: this.memoryStore,
            cookie: {
                secure: true,
                httpOnly: true
            }
        });
    }

    /**
     * Return the keycloak middleware
     */
    public get middleware(): RequestHandler[] {
        return this.keycloak.middleware();
    }

    /**
     * Return the KcAdminClient,
     * used for internal API request with Keycloak
     */
    public get adminClient(): KcAdminClient {
        return this.kcAdminClient;
    }

    /**
     * Return the middleware to protecting resources
     * @param roles you can specify the roles that the user must have
     */
    public protect(roles?: Array<string>): RequestHandler {
        if (!roles) {
            return this.keycloak.protect();
        }
        if (roles.length === 1) {
            return this.keycloak.protect(roles[0])
        }
        return this.keycloak.protect((_, req, __) => {
            const user = this.getCurrentUser(req);
            return user ? user.hasRole(roles) : false;
        });
    }

    /**
     * Perform live validation of an access_token against the Keycloak server.
     * @param token The token to validate.
     * @throws UnauthorizedException if token is expired or invalid
     * @return currentUser if token is valid return a KcTokenUser.
     */
    public async validateAccessToken(token: string): Promise<KcTokenUser> {
        const [user, client] = await Promise.all([
            this.keycloak.grantManager.userInfo(token)
                .then(userRaw => userRaw as any)
                .catch(error => {
                    throw new UnauthorizedException(error.message);
                }),
            this.getClient()
        ]);

        return this.kcAdminClient.users.listCompositeClientRoleMappings({
            id: user.sub,
            clientUniqueId: client.id!
        }).then(roles => {
            return new KcTokenUser(
                user.sub,
                user.preferred_username,
                user.email_verified,
                roles.map(role => role.name!)
            );
        });
    }

    /**
     * Initialize the KcAdminClient,
     * used for internal API request with Keycloak
     */
    public async init(): Promise<void> {
        await this.kcAdminClient
            .auth(this.config.adminCredentials as Credentials)
            .catch(e => {
                Logger.error(JSON.stringify(Object.assign(e.toJSON(), {data: e.response?.data}), null, "\t"));
            });

        const keycloakIssuer = await Issuer.discover(`${this.config.baseUrl}/realms/${this.config.realmName}`);
        const client = new keycloakIssuer.Client({
            client_id: this.config.adminCredentials.clientId, // Same as `clientId` passed to client.auth()
            token_endpoint_auth_method: 'none', // to send only client_id in the header
        });

        let tokenSet = await client.grant({
            grant_type: this.config.adminCredentials.grantType,
            username: this.config.adminCredentials.username,
            password: this.config.adminCredentials.password,
        });

        // Periodically using refresh_token grant flow to get new access token here
        setInterval(async () => {
            tokenSet = await client.refresh(tokenSet).catch(error => { // get the refresh_token from tokenSet
                Logger.warn(`kcAdminClient token refresh: ${error.stack}`);
                return client.grant({
                    grant_type: this.config.adminCredentials.grantType,
                    username: this.config.adminCredentials.username,
                    password: this.config.adminCredentials.password,
                });
            });
            this.kcAdminClient.setAccessToken(tokenSet.access_token!);
            Logger.debug('kcAdminClient token refreshed');
        }, (tokenSet.expires_in || 60) * 1000); // 300 || 60 seconds
    }

    /**
     * Retrieves the current Client
     */
    public async getClient(): Promise<ClientRepresentation> {
        const clients = await this.kcAdminClient.clients.find({clientId: environment.keycloakConfig.clientId});
        if (!clients[0] || !clients[0].id) {
            throw new InternalServerErrorException("keycloak Client ID not found");
        }
        return clients[0];
    }

    /**
     * Retrieves the current user, who made the request, from the request
     * @param req the request
     */
    public getCurrentUser(req: Request | IncomingMessage): KcTokenUser | undefined {
        if (!req.hasOwnProperty('kauth')) {
            return;
        }

        // @ts-ignore (kauth)
        const content: any = req.kauth.grant?.access_token.content;
        return content ? new KcTokenUser(
            content.sub,
            content.preferred_username,
            content.email_verified,
            content.resource_access[this.config.clientId!]?.roles,
            content.realm_access.roles
        ) : undefined;
    }
}

export class KcTokenUser {
    id: string;
    preferredUsername: string;
    emailVerified: boolean;
    roles: Array<string>;
    realmRoles?: Array<string>;

    constructor(id: string, preferredUsername: string, emailVerified: boolean, roles: Array<string>, realmRoles?: Array<string>) {
        this.id = id;
        this.preferredUsername = preferredUsername;
        this.emailVerified = emailVerified;
        this.roles = roles;
        this.realmRoles = realmRoles;
    }

    /**
     * Check if user has one of the roles indicated
     * @param roles roles to check if assigned to the user
     */
    hasRole(roles: Array<string>): boolean {
        return this.roles ? this.roles.some(role => roles.includes(role)) : false;
    }

    /**
     * Check if user is a Admin role
     */
    isAdmin(): boolean {
        return this.hasRole([environment.appRoles.admin]);
    }

    /**
     * Check if user is a User role
     */
    isUser(): boolean {
        return this.hasRole([environment.appRoles.user]);
    }

}

const KeycloakHelper = new KcHelper();
export default KeycloakHelper;
