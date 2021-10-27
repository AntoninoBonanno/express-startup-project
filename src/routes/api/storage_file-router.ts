import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import fileUpload from "express-fileupload";
import StorageFileValidation from "../../validations/storage_file-validation";
import StorageFileController from "../../controllers/storage_file-controller";

const storageFileRouter = express.Router();
storageFileRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(StorageFileController.findById)
);

storageFileRouter.get(
    '/:id/download',
    GeneralValidation.onlyIdParam,
    wrap(StorageFileController.download)
);

storageFileRouter.post(
    '/',
    StorageFileValidation.create,
    fileUpload({ // Add FileUpload middleware
        limits: {fileSize: 50 * 1024 * 1024},
        createParentPath: true
    }),
    wrap(StorageFileController.create)
);

export default storageFileRouter;
