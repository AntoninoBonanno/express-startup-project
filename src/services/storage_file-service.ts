import fs from "fs";
import prisma from "../helpers/prisma";
import environment from "../environment";
import {UploadedFile} from "express-fileupload";
import {Prisma, StorageFile} from "@prisma/client";
import {InternalServerErrorException, NotFoundException} from "../exceptions/http-exceptions";

export default class StorageFileService {

    /**
     * Check if file exists in to storage
     * @param path path of file
     */
    static existFile(path: string): boolean {
        return fs.existsSync(`${environment.storagePath}/${path}`);
    }

    /**
     * Save new file in to storage
     * @param file the file to save to storage
     * @param path the path of file in storage
     */
    static async saveFile(file: UploadedFile, path: string): Promise<string> {
        return file.mv(`${environment.storagePath}/${path}`).then(_ => path);
    }

    /**
     * Return the list of StorageFiles
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.StorageFileWhereInput): Promise<StorageFile[]> {
        return prisma.storageFile.findMany({
            skip: pageSize * currentPage,
            take: pageSize,
            where: {
                deletedAt: null,
                ...where
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Create a new StorageFile
     * @param input the StorageFile data
     */
    static async create(input: Prisma.StorageFileCreateInput): Promise<StorageFile> {
        if (!this.existFile(input.path)) {
            throw new InternalServerErrorException(`Unable to find file: ${input.path}`);
        }
        return prisma.storageFile.create({data: input}).catch(error => {
            this.deleteFile(input.path);
            throw new InternalServerErrorException(error.stack);
        });
    }

    /**
     * Return the specific element
     * @param id id of element
     * @param where query conditions
     */
    static async find(id: number, where?: Prisma.StorageFileWhereInput): Promise<StorageFile> {
        const storageFile = await prisma.storageFile.findFirst({
            where: {id, deletedAt: null, ...where}
        });

        if (!storageFile) {
            throw new NotFoundException(id.toString());
        }

        return storageFile;
    }

    /**
     * Update many StorageFiles
     * @param ids the ids of StorageFiles to update
     * @param input the StorageFile data
     */
    static async updateMany(ids: Array<number>, input: Prisma.StorageFileUpdateInput): Promise<Prisma.BatchPayload> {
        return prisma.storageFile.updateMany({
            data: input,
            where: {id: {in: ids}}
        });
    }

    /**
     * Soft delete an StorageFile
     * @param id id of element
     */
    static async delete(id: number): Promise<StorageFile> {
        return prisma.storageFile.delete({where: {id}}).then(storageFile => {
            // TODO: delete the file when the database record is deleted,
            //  example you can use a periodic cronjob that cleans soft deletes from the database
            /*if (this.existFile(storageFile.path)) {
                this.deleteFile(storageFile.path);
            }*/
            return storageFile;
        });
    }

    /**
     * Remove file from storage
     * @param path path of file
     */
    private static deleteFile(path: string): void {
        fs.unlink(`${environment.storagePath}/${path}`, err => {
            throw new InternalServerErrorException(err?.stack || `Unable to delete file: ${path}`);
        });
    }
}

