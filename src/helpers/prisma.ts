import {Prisma, PrismaClient, StorageFile} from "@prisma/client";
import environment from "../environment";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

declare global {
    var prisma: PrismaClient | undefined
}

const prisma: PrismaClient = global.prisma || new PrismaClient();
prisma.$use(async (params, next) => {
    //Soft delete, on delete action change to update and put current date on deletedAt
    if (params.action == 'delete') {
        params.action = 'update'
        params.args['data'] = {deletedAt: new Date()}
    } else if (params.action == 'deleteMany') {
        params.action = 'updateMany'
        if (params.args.data != undefined) {
            params.args.data['deletedAt'] = new Date()
        } else {
            params.args['data'] = {deletedAt: new Date()}
        }
    }

    return next(params);
});

if (!environment.isProduction()) global.prisma = prisma;
export default prisma;

/**
 * Convert an Array<number> in to Array<{ id: number; }>
 * @param input the Array<number>
 */
function convertNumbersToIds(input: Array<number>): Array<{ id: number; }> {
    const arrayIds: Array<{ id: number; }> = [];
    input.forEach((id: number) => {
        arrayIds.push({id});
    });

    return arrayIds;
}

/**
 * Convert an Array<number> in to Prisma.StorageFileUpdateManyWithoutPostInput with {connect, disconnect}
 * Allows you to create the object to add or remove StorageFile relationships via a list of ids
 *
 * @param numbers the Array<number>
 * @param oldStorageFiles the old StorageFile relationships, they will be removed if not found in the Array<number>
 */
export function convertNumbersToStorageFileUpdateMany(numbers: Array<number>, oldStorageFiles: (StorageFile[] | undefined) = undefined): Prisma.StorageFileUpdateManyWithoutPostInput {
    const connect = convertNumbersToIds(numbers);
    if (oldStorageFiles) {
        const disconnect = convertNumbersToIds(oldStorageFiles.filter(storage => !numbers.includes(storage.id)).map(storage => storage.id));
        return {connect, disconnect};
    }
    return {connect};
}
