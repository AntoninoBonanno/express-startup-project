import {Request, Response} from "express";
import KeycloakHelper from "../helpers/keycloak-helper";
import environment from "../environment";
import IKcUser from "../interfaces/kc-user";
import {matchedData} from "express-validator";

export default class UserController {

    /**
     * Return the list of Keycloak KcUser
     * @param req the request
     * @param res the response as a Users
     */
    static async list(req: Request, res: Response): Promise<void> {
        const queryData = matchedData(req, {locations: ['query']}); // Get only validated params

        const kcAdminClient = KeycloakHelper.adminClient,
            kcUsers = await kcAdminClient.users.find(),
            client = await KeycloakHelper.getClient();

        let users: Array<IKcUser> = await Promise.all(kcUsers
            .filter(user => user.username !== environment.keycloakConfig.adminCredentials.username)
            .map(async kcUser => {
                return {
                    ...kcUser,
                    roles: await kcAdminClient.users.listCompositeClientRoleMappings({
                        id: kcUser.id!,
                        clientUniqueId: client.id!
                    })
                }
            })
        );

        if (queryData.role) {
            users = users.filter(user => user.roles.some(role => role.name === queryData.role));
        }

        res.send(users);
    }

    /**
     * Return the list of Keycloak Roles for current clientId
     * @param req the request
     * @param res the response as a RoleRepresentation[]
     */
    static async roles(req: Request, res: Response): Promise<void> {
        const client = await KeycloakHelper.getClient();
        res.send(await KeycloakHelper.adminClient.clients.listRoles({id: client.id!}));
    }
}
