import Logger from "../helpers/logger";
import IStatusMessage from "../interfaces/status-message";
import {NextFunction, Request, Response} from 'express';
import {StatusCodes} from "http-status-codes";
import HttpException, {
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    UnauthorizedException
} from '../exceptions/http-exceptions';

/**
 * Handle and catch the HttpException
 * Log the exception and sends `StatusMessage` type responses with the correct code
 * @param err the HttpException error
 * @param req the Request
 * @param res the Response
 * @param _ the NextFunction
 */
function httpErrorMiddleware(err: HttpException, req: Request, res: Response, _: NextFunction): void {
    const status = err.status;
    const message = err.uiMessage;
    const errors = err instanceof BadRequestException ? err.errors : undefined;

    const logMessage = `[${status}] ${req.method} ${req.path} -> ${err.message || err.uiMessage}`;
    switch (err.constructor) {
        case BadRequestException:
            Logger.warn(logMessage + ` ${JSON.stringify(errors)}`);
            break;
        case ForbiddenException:
        case UnauthorizedException:
            Logger.warn(logMessage);
            break;
        case InternalServerErrorException:
            Logger.error(logMessage);
            break;
        default:
            Logger.info(logMessage);
    }
    const response: IStatusMessage = {status, message, errors};
    res.status(status).send(response);
}

/**
 * Handle and catch all Error
 * Log the exception and sends `StatusMessage` type responses with the correct code
 * @param err the error
 * @param req the Request
 * @param res the Response
 * @param next the NextFunction
 */
export default function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof HttpException) {
        return httpErrorMiddleware(err, req, res, next);
    }

    // @ts-ignore
    if (err instanceof SyntaxError && err.status === 400) {
        return httpErrorMiddleware(new BadRequestException([{
            msg: err.message,
            // @ts-ignore
            value: ('body' in err) ? err.body : '',
            param: 'body',
            location: 'body'
        }]), req, res, next);
    }

    Logger.error(`[500] ${req.method} ${req.path} -> ${err.stack}`);
    const response: IStatusMessage = {status: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Something went wrong'};
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(response);
}
