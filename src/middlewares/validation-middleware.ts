import {NextFunction, Request, RequestHandler, Response} from "express";
import {ValidationChain, validationResult} from 'express-validator';
import {BadRequestException} from "../exceptions/http-exceptions";

export type ValidationMiddleware = [...ValidationChain[], RequestHandler]

/**
 * Validate the input parameters from ValidationChain
 * and sent a BadRequest if parameters are invalid
 * @param chains the ValidationChain
 */
export default function validationMiddleware(chains: ValidationChain[]): ValidationMiddleware {
    return [
        ...chains,
        (req: Request, res: Response, next: NextFunction): void => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new BadRequestException(errors.array())
            }
            next();
        }
    ];
}
