import {body, param} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import {isNotUsedStorageIds} from "./storage_file-validation";
import ICrudValidation from "../interfaces/crud-validation";

/** VALIDATIONS **/

const PostValidation: ICrudValidation = {
    create: validationMiddleware([
        body('title').isString().trim(),
        body('body').isString().trim(),
        body('attachmentIds').isArray({min: 1}).isNumeric().custom(isNotUsedStorageIds)
    ]),
    update: validationMiddleware([
        param('id').isNumeric(),

        body('title').optional().isString().trim(),
        body('body').optional().isString().trim(),
        body('attachmentIds').optional().isArray({min: 1}).isNumeric().custom(isNotUsedStorageIds)
    ])
};
export default PostValidation;
