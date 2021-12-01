import {body} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import {isNotUsedStorageIds} from "./storage_file-validation";
import ICrudValidation from "../interfaces/crud-validation";
import {idParamChain} from "./shared/general-validation";

/** VALIDATIONS **/

const PostValidation: ICrudValidation = {
    create: validationMiddleware([
        body('title').isString().trim(),
        body('body').isString().trim(),
        body('attachmentIds').isArray({min: 1}).isInt({min: 0}).toInt().custom(isNotUsedStorageIds)
    ]),
    update: validationMiddleware([
        idParamChain,

        body('title').optional().isString().trim(),
        body('body').optional().isString().trim(),
        body('attachmentIds').optional().isArray({min: 1}).isInt({min: 0}).toInt().custom(isNotUsedStorageIds)
    ])
};
export default PostValidation;
