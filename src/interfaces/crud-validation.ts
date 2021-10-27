import {ValidationMiddleware} from "../middlewares/validation-middleware";

export interface IListValidation {
    list: ValidationMiddleware
}

export interface IFindByIdValidation {
    findById: ValidationMiddleware
}

export interface ICreateValidation {
    create: ValidationMiddleware
}

export interface IUpdateValidation {
    update: ValidationMiddleware
}

export interface IDeleteValidation {
    delete: ValidationMiddleware
}

export default interface ICrudValidation {
    list?: ValidationMiddleware
    findById?: ValidationMiddleware,
    create: ValidationMiddleware,
    update: ValidationMiddleware,
    delete?: ValidationMiddleware
}
