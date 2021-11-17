import {Request, Response} from "express";
import {BadRequestException, NotFoundException} from "../exceptions/http-exceptions";
import environment from "../environment";
import KeycloakHelper from "../helpers/keycloak-helper";
import {UploadedFile} from "express-fileupload";
import StorageFileService from "../services/storage_file-service";
import {nanoid} from "nanoid/non-secure";

export default class StorageFileController {

    /**
     * Find a StorageFile resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a StorageFile
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await StorageFileService.find(Number(id)));
    }

    /**
     * Download a StorageFile resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a File
     */
    static async download(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        const storageFile = await StorageFileService.find(Number(id));
        if (!StorageFileService.existFile(storageFile.path)) {
            throw new NotFoundException(`Unable to find file (id ${storageFile.id}): ${storageFile.path}`);
        }
        res.download(`${environment.storagePath}/${storageFile.path}`, storageFile.name);
    }

    /**
     * Create a new instance of File
     * @param req the validated File\create request
     * @param res the response as a File
     */
    static async create(req: Request, res: Response): Promise<void> {
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.uploadFile) {
            throw new BadRequestException([{
                msg: "Invalid value",
                param: "upload_file",
                location: "body",
                value: undefined
            }]);
        }

        const currentUser = KeycloakHelper.getCurrentUser(req)!,
            uploadFile = req.files.uploadFile as UploadedFile;

        const path = await StorageFileService.saveFile(uploadFile, `${currentUser.id}/${nanoid()}`);
        const storageFile = await StorageFileService.create({
            name: uploadFile.name,
            description: req.body.description,
            mimetype: uploadFile.mimetype,
            path: path
        });

        res.send(storageFile);
    }

}
