import {body, param} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import ICrudValidation from "../interfaces/crud-validation";

/** VALIDATIONS **/

const NotificationValidation: ICrudValidation = {
    create: validationMiddleware([
        body('keycloakId').notEmpty().isString().trim(),
        body('level').isString().trim(),
        body('data').isObject()
    ]),
    update: validationMiddleware([
        param('id').isNumeric(),

        body('read').optional().isBoolean()
    ])
};
export default NotificationValidation;
