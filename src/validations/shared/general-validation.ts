import {param, query} from "express-validator";
import validationMiddleware from "../../middlewares/validation-middleware";

/** CHAINS **/

export const paginatedListChain = [
    query('pageSize').default(10).isNumeric(),
    query('currentPage').default(0).isNumeric()
];

/** VALIDATIONS **/

const GeneralValidation = {
    paginatedList: validationMiddleware(paginatedListChain),
    onlyIdParam: validationMiddleware([
        param('id').isNumeric()
    ])
};
export default GeneralValidation;
