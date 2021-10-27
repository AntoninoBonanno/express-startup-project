import {param, query} from "express-validator";
import validationMiddleware from "../../middlewares/validation-middleware";

/** VALIDATIONS **/

const GeneralValidation = {
    paginatedList: validationMiddleware([
        query('pageSize').default(10).isNumeric(),
        query('currentPage').default(0).isNumeric()
    ]),
    onlyIdParam: validationMiddleware([
        param('id').isNumeric()
    ])
};
export default GeneralValidation;
