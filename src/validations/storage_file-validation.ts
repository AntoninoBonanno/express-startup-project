import {body, CustomValidator} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import StorageFileService from "../services/storage_file-service";
import {ICreateValidation} from "../interfaces/crud-validation";

/** VALIDATIONS **/

const StorageFileValidation: ICreateValidation = {
    create: validationMiddleware([
        body('description').optional().isString().trim()
    ])
};
export default StorageFileValidation;


/** CUSTOM VALIDATORS **/

/**
 * Check if the storage file ids passed as arrays exist and are not associated with other resources
 * A StorageFile cannot be associated with multiple resources at the same time
 * @param value the body array value
 * @param req the request
 */
export const isNotUsedStorageIds: CustomValidator = (value, {req}) => {
    if (!Array.isArray(value)) {
        return Promise.reject('The input is not an array');
    }

    const OR: Array<any> = [{postId: null}];
    const id = Number(req.params?.id);
    if (id) {
        OR.push({postId: id});
    }

    return StorageFileService.list(undefined, undefined, {
        id: {in: value},
        OR
    }).then(storageFiles => {
        if (storageFiles.length !== value.length) {
            const availableIds = storageFiles.map(storage => storage.id);
            const errorsIds = value.filter(valueId => !availableIds.includes(valueId));

            // A StorageFile cannot be associated with multiple resources at the same time
            return Promise.reject(`The ids [${errorsIds}] they cannot be associated with this resource`);
        }
        return true;
    });
}
