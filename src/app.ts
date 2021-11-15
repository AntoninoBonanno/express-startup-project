import cors from "cors";
import Helmet from "helmet";
import {createServer} from "http";
import Logger from "./helpers/logger";
import environment from "./environment";
import IoSocket from "./helpers/io-socket";
import express, {Application} from 'express';
import rootRouter from "./routes/root-router";
import {hostname, networkInterfaces} from "os";
import KeycloakHelper from "./helpers/keycloak-helper";
import errorMiddleware from "./middlewares/error-middleware";
import morganMiddleware from "./middlewares/morgan-middleware";

const app: Application = express();
const server = createServer(app);

/** Security and config **/
app.use(Helmet()); // Add security configuring HTTP headers appropriately
app.use(cors()); // Enable cors
app.use(express.json()); // Json parser

app.use(KeycloakHelper.session); // Enable Keycloak session

/** Middlewares **/
app.use(morganMiddleware); // Print http logs in development mode
app.use(KeycloakHelper.middleware); // Add Keycloak middleware

/** Routes **/
app.use('/', rootRouter);

/** Handlers **/
app.use(errorMiddleware); // Error handler
process.on('unhandledRejection', (error: Error) => { // Unhandled error handler
    Logger.error(`[unhandledRejection] ${error.stack}`);
});

/** Listen on provided port, on all network interfaces. **/
server.listen(environment.port, async (): Promise<void> => {
    const ip = environment.isProduction() ?
        Object.values(networkInterfaces()).flat().find(details => details && details.family == 'IPv4' && !details.internal)?.address
        : 'localhost';
    Logger.info(`⚡ ${environment.appName} Server Running here -> ${ip ?? hostname()}:${environment.port}`);
    await KeycloakHelper.init();  // init keycloak
});

const ioSocket = new IoSocket(server);
export {ioSocket};
