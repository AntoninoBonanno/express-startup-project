import {query} from "express-validator";
import environment from "../environment";
import {IListValidation} from "../interfaces/crud-validation";
import validationMiddleware from "../middlewares/validation-middleware";

/** VALIDATIONS **/

const UserValidation: IListValidation = {
    list: validationMiddleware([
        query("role").optional().isIn(Object.values(environment.appRoles))
    ])
};
export default UserValidation;
