import {Server, ServerOptions, Socket} from "socket.io";
import * as http from "http";
import Logger from "./logger";
import KeycloakHelper from "./keycloak-helper";
import IStatusMessage from "../interfaces/status-message";
import {StatusCodes} from "http-status-codes";

export default class IoSocket extends Server {
    private clients: Map<string, Socket> = new Map<string, Socket>();

    constructor(srv: http.Server | number, opts?: Partial<ServerOptions>) {
        super(srv, opts);

        this.on('connection', (socket: Socket) => { // Socket.io handler on connection
            Logger.debug('(Socket) Client connection');

            socket.on('authentication', async (data: any) => {
                // As soon as authentication is requested, check if the token received is valid
                const accessToken = await KeycloakHelper.validateAccessToken(data).catch(error => {
                    const errorMessage: IStatusMessage = {
                        status: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: `Internal server error`
                    };
                    // Error on verify token: send an `unauthorized` event with status 500 and disconnect the user
                    socket.emit('unauthorized', errorMessage);
                    socket.disconnect();

                    throw new Error(`(Socket) [${errorMessage.status}] ${error.stack}`);
                });

                let statusMessage: IStatusMessage;
                if (!accessToken) {
                    statusMessage = {
                        status: StatusCodes.UNAUTHORIZED,
                        message: `Authentication failure socket ${socket.id}`
                    };
                    // Invalid token: send an `unauthorized` event with status 401 and disconnect the user
                    Logger.warn(`(Socket) [${statusMessage.status}] ${statusMessage.message}`);
                    socket.emit('unauthorized', statusMessage);
                    return socket.disconnect();
                }

                // Valid token: send an `authenticated` event with status 200 and store the user for send other requests
                statusMessage = {status: StatusCodes.OK, message: `Authentication success`};
                Logger.info(`(Socket) [${statusMessage.status}] Authenticated client connection: ${socket.id}`);
                socket.emit('authenticated', statusMessage);

                this.clients.set(socket.id, socket);
            });

            socket.on('disconnect', () => {
                // When an account disconnect, remove it from stored users
                Logger.info(`(Socket) Client disconnected: ${socket.id}`);
                if (this.clients.has(socket.id)) {
                    this.clients.delete(socket.id);
                }
            });

            setTimeout(() => {
                // If the socket didn't authenticate after connection, disconnect it
                if (!this.clients.has(socket.id)) {
                    Logger.debug(`(Socket) Disconnecting not authenticated socket: ${socket.id}`);
                    socket.disconnect();
                }
            }, 10 * 1000); // 10 Seconds
        });
    }

    /**
     * Emit event only to authenticated clients
     * @param event event name
     * @param args the event content
     */
    public emitAuthenticated(event: string, ...args: any[]): void {
        this.clients.forEach((socket: Socket, _: string) => {
            socket.emit(event, args);
        });
    }
}
