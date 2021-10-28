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
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

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
            store: this.memoryStore
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
     * @param role you can specify the role that the user must have
     */
    public protect(role?: string): RequestHandler {
        return this.keycloak.protect(role);
    }

    /**
     * Perform live validation of an access_token against the Keycloak server.
     * @param token The token to validate.
     * @param getUser If is true and token is valid return a UserRepresentation.
     * @return validatedToken false if the token is invalid, the same token if valid or if is specified a UserRepresentation.
     */
    public async validateAccessToken(token: string, getUser: boolean = false): Promise<string | boolean | UserRepresentation> {
        const validatedToken = await this.keycloak.grantManager.validateAccessToken(token);
        if (getUser && validatedToken) {
            return this.keycloak.grantManager.userInfo(token).then((user: any) => {
                return {
                    id: user.sub,
                    emailVerified: user.email_verified,
                    username: user.preferred_username
                } as UserRepresentation
            });
        }
        return validatedToken;
    }

    /**
     * Initialize the KcAdminClient,
     * used for internal API request with Keycloak
     */
    public async init(): Promise<void> {
        await this.kcAdminClient
            .auth(this.config.adminCredentials as Credentials)
            .catch(e => {
                throw new Error(JSON.stringify(Object.assign(e.toJSON(), {data: e.response?.data}), null, "\t"));
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
            tokenSet = await client.refresh(tokenSet); // get the refresh_token from tokenSet
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
        // // @ts-ignore
        // this.keycloak.grantManager.userInfo(req.kauth.grant?.access_token)
        //     .then(user => console.log(user));
    }
}

export class KcTokenUser {
    id: string;
    preferredUsername: string;
    emailVerified: boolean;
    roles: Array<string>;
    realmRoles: Array<string>;

    constructor(id: string, preferredUsername: string, emailVerified: boolean, roles: Array<string>, realmRoles: Array<string>) {
        this.id = id;
        this.preferredUsername = preferredUsername;
        this.emailVerified = emailVerified;
        this.roles = roles;
        this.realmRoles = realmRoles;
    }

    /**
     * Check if user is a Admin role
     */
    isAdmin(): boolean {
        return this.roles.some(role => role === environment.appRoles.admin);
    }

    /**
     * Check if user is a User role
     */
    isUser(): boolean {
        return this.roles.some(role => role === environment.appRoles.user);
    }

}

const KeycloakHelper = new KcHelper();
export default KeycloakHelper;