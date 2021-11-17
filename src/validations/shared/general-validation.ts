import {param, query} from "express-validator";
import validationMiddleware from "../../middlewares/validation-middleware";

/** CHAINS **/

export const paginatedListChain = [
    query('pageSize').default(10).isInt({min: 1}),
    query('currentPage').default(0).isInt({min: 0})
];

export const idParamChain = param('id').isInt({min: 1});

/** VALIDATIONS **/

const GeneralValidation = {
    paginatedList: validationMiddleware(paginatedListChain),
    onlyIdParam: validationMiddleware([
        idParamChain
    ])
};
export default GeneralValidation;
