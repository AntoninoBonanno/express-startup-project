# Keycloak

The APIs are protected by [Keycloak](https://www.keycloak.org/) IAM. Two libraries were used:
- [keycloak-connect](https://www.npmjs.com/package/keycloak-connect): to manage the protection of routes 
- [keycloak-admin-client](https://www.npmjs.com/package/@keycloak/keycloak-admin-client): to query Keycloak via API

## Install Keycloak on Docker

See the [official documentation](https://www.keycloak.org/getting-started)

## Keycloak settings

From [Keycloak Admin Console](http://localhost:8080/auth/admin)

1. Create new realm (`KEYCLOAK_REALM`)
2. Go to **"Clients"** section and create new client (`KEYCLOAK_CLIENT_ID`)
    1. Set `Access Type` as `confidential`
    2. Enable `Standard Flow Enabled`, `Implicit Flow Enabled` and `Direct Access Grants Enabled`
    3. Go to "Credentials" tab to get the secret (`KEYCLOAK_CLIENT_SECRET`)
    4. Go to "Roles" tab to make new application roles: `admin`, `user`
3. Go to **"Roles"** section and create new `nodejs-kc-admin` role
    1. Enable `Composite Roles` and from "Client Roles" `realm-management` add the following roles:
        - `manage-clients`
        - `manage-users`
        - `view-clients`
        - `view-users`
4. Go to "Users" section and create new `api-kc-admin` (`KEYCLOAK_API_ADMIN_USERNAME`) user with a non-temporary password (`KEYCLOAK_API_ADMIN_PASSWORD`)
    1. From "Role Mappings" tab add `nodejs-kc-admin` "Realm Roles"
    2. Make sure you don't reuse `nodejs-kc-admin` role to other users (Only used for api calls from the nodejs backend)
5. Put the information inside the application `.env` file
6. Go to **"Roles"** section and create new `app-admin`, `app-user` roles
    1. For each role enable `Composite Roles` and from Client ID just created in "Client Roles" associate:
    - `admin` in `app-admin`
    - `user` in `app-user`

   Use `app-admin`, `app-user` roles to identify and associate app user roles

Notes:
- Make sure the Client ID `admin-cli` is enabled
- **For test** make sure the "Require SSL" is `none` in Realm Settings -> Login (tab); Enable "Require SSL" after https configuration. 

## Development
For better use, the two libraries have been grouped into a custom class: KeycloakHelper, located in `src\helpers\keycloak-helper.ts`
and is initialized in `src\app.ts`.

### Usage

#### Route protection

You can protect a route by `KeycloakHelper.protect(role?: string)` method. 

Each client to make a request must insert the `Authorization` in the header as `Bearer {{accessToken}}`.
- If the `accessToken` has expired or is not valid a response of type `IStatusMessage` with `401` code will be returned
- If a role has been specified in the `protect` method and the user has not associated that role a response of type `IStatusMessage` with `403` code will be returned

The accessToken it must be retrieved by [logging into keycloak](https://www.keycloak.org/docs/latest/securing_apps/index.html#token-endpoint) 

```
import KeycloakHelper from "../helpers/keycloak-helper";

...

const router = express.Router();

// All roles
router.use('/your-route', KeycloakHelper.protect(), anyController);

// Specific role
router.use('/your-route', KeycloakHelper.protect(environment.appRoles.admin), anyController);
```

#### Keycloak query
To make a Keycloak query you need the `KeycloakHelper.adminClient` and then you call the [supported APIs](https://github.com/keycloak/keycloak-nodejs-admin-client#supported-apis).

```
const kcAdminClient = KeycloakHelper.adminClient; 
const kcUsers = await kcAdminClient.users.find(); // Keycloak query
```

#### Support methods

```
// Retrieve the current user from the request (who made the request)
const currentUser = KeycloakHelper.getCurrentUser(req)!;

// Perform live validation of an access_token against the Keycloak server.
// return false if the token is invalid, the same token if valid or if is specified a UserRepresentation.
const accessToken = await KeycloakHelper.validateAccessToken(data, false);

// Retrieves the current Client
const client = await KeycloakHelper.getClient();
```
