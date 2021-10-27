import {ValidationError} from "express-validator";
import {StatusCodes} from "http-status-codes";

export default class HttpException extends Error {
    status: StatusCodes;
    uiMessage: string;

    /**
     * The HttpException
     * @param status the status code of error
     * @param uiMessage message to send to the client
     * @param message the internal message error (it is not sent to the client)
     */
    constructor(status: StatusCodes, uiMessage: string, message?: string) {
        super(message);
        this.status = status;
        this.uiMessage = uiMessage;
    }
}

/**
 * 400 Bad Request response status code indicates that the server
 * cannot or will not process the request due to something that is perceived
 * to be a client error
 */
export class BadRequestException extends HttpException {
    errors?: ValidationError[];

    /**
     * The Bad Request Exception
     * @param errors the errors to send to the client
     */
    constructor(errors: ValidationError[]) {
        super(StatusCodes.BAD_REQUEST, 'Bad Request');
        this.errors = errors;
    }
}

/**
 * 401 Unauthorized client error response code indicates that the request
 * has not been applied because it lacks valid authentication credentials for the target resource.
 */
export class UnauthorizedException extends HttpException {

    /**
     * The Unauthorized Exception,
     * To indicate that lacks valid authentication credentials for the target resource.
     * @param message custom message to be sent to the client [default: 'Unauthorized']
     */
    constructor(message?: string) {
        super(StatusCodes.UNAUTHORIZED, message ? message : 'Unauthorized');
    }
}

/**
 * 403 Forbidden client error response code indicates that the server
 * understood the request but refuses to authorize it.
 */
export class ForbiddenException extends HttpException {

    /**
     * The Forbidden Exception,
     * To indicate that the server understood the request but refuses to authorize it.
     * @param message custom message to be sent to the client [default: 'Access denied']
     */
    constructor(message?: string) {
        super(StatusCodes.FORBIDDEN, message ? message : 'Access denied');
    }
}

/**
 * 404 Not Found client error response code indicates that the server
 * can't find the requested resource.
 */
export class NotFoundException extends HttpException {

    /**
     * The Not Found Exception,
     * To indicate that a resource was not found
     * @param message custom message to be sent to the client or the resource id not found
     * @param isResourceId false if message is a custom message, true if message is the resource id [default: true]
     */
    constructor(message: string, isResourceId = true) {
        super(StatusCodes.NOT_FOUND, isResourceId ? `Resource with id ${message} not found` : message);
    }
}

/**
 * 500 Internal Server Error server error response code
 * indicates that the server encountered an unexpected condition that
 * prevented it from fulfilling the request.
 */
export class InternalServerErrorException extends HttpException {

    /**
     * The Internal Server Error Exception,
     * @param message The error message, will only be saved in the internal log
     */
    constructor(message: string) {
        super(StatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong', message);
    }
}
