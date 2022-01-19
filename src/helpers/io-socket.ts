import {Server, ServerOptions, Socket} from "socket.io";
import * as http from "http";
import Logger from "./logger";
import KeycloakHelper from "./keycloak-helper";
import IStatusMessage from "../interfaces/status-message";
import {StatusCodes} from "http-status-codes";
import {ForbiddenException, UnauthorizedException} from "../exceptions/http-exceptions";

export default class IoSocket extends Server {
    private clients: Map<string, Socket> = new Map<string, Socket>();

    constructor(srv: http.Server | number, opts?: Partial<ServerOptions>) {
        super(srv, opts);

        this.on('connection', (socket: Socket) => { // Socket.io handler on connection
            Logger.debug('(Socket) Client connection');

            socket.on('authentication', async (accessToken: string) => {
                try {
                    // As soon as authentication is requested, check if the token received is valid
                    const currentUser = await KeycloakHelper.validateAccessToken(accessToken);
                    if (currentUser.isUser()) {
                        // TODO: Add the Auth logic
                        throw new ForbiddenException();
                    }

                    // Valid token: send an `authenticated` event with status 200 and store the user for send other requests
                    this.clients.set(socket.id, socket);

                    const statusMessage = {status: StatusCodes.OK, message: `Authentication success`};
                    Logger.info(`(Socket) [${statusMessage.status}] Authenticated client connection: ${socket.id}`);
                    socket.emit('authenticated', statusMessage);
                } catch (error) {
                    IoSocket.handleErrors(error, socket);
                }
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
     * Handle the socket errors and disconnect the socket
     * @param error the error
     * @param socket the socket
     */
    private static handleErrors(error: unknown, socket: Socket): void {
        let errorMessage: IStatusMessage = {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: `Internal server error`
        };

        if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
            errorMessage = error instanceof UnauthorizedException ? {
                status: StatusCodes.UNAUTHORIZED,
                message: `Authentication failure socket ${socket.id}`
            } : {
                status: StatusCodes.FORBIDDEN,
                message: error.uiMessage
            };
            Logger.warn(`(Socket) [${errorMessage.status}] ${errorMessage.message}`);
        } else if (error instanceof Error) {
            Logger.error(`(Socket) [${errorMessage.status}] ${error.stack}`);
        }

        socket.emit('unauthorized', errorMessage);
        socket.disconnect();
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
