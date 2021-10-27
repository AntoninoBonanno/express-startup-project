import * as dotenv from "dotenv";

dotenv.config();
const environment = {
    /**
     * The app name
     */
    appName: process.env.APP_NAME || 'My App',

    /**
     * The environment mode
     */
    appEnv: process.env.APP_ENV || 'development',

    /**
     * Return true if app is in production mode
     */
    isProduction: (): boolean => environment.appEnv !== 'development',

    /**
     * The app port
     */
    port: process.env.APP_PORT || 8000,

    /**
     * The app roles
     */
    appRoles: {
        admin: "admin",
        user: "user"
    },

    /**
     * The Keycloak config
     */
    keycloakConfig: {
        baseUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080/auth',
        realmName: process.env.KEYCLOAK_REALM || 'master',
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        adminCredentials: {
            username: process.env.KEYCLOAK_API_ADMIN_USERNAME,
            password: process.env.KEYCLOAK_API_ADMIN_PASSWORD,
            grantType: 'password',
            clientId: process.env.KEYCLOAK_API_ADMIN_CLIENT_ID || 'admin-cli',
        }
    },

    storagePath: `${__dirname}/../storage`
};

export default environment;
