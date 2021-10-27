import {ValidationError} from "express-validator";
import {StatusCodes} from "http-status-codes";

export default interface IStatusMessage {
    status: StatusCodes,
    message: string,
    errors?: ValidationError[]
}
