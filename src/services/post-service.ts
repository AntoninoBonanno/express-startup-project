import prisma from "../helpers/prisma";
import {Post, Prisma, StorageFile} from "@prisma/client";
import {InternalServerErrorException, NotFoundException} from "../exceptions/http-exceptions";

export default class PostService {

    /**
     * The fields to include in json response
     */
    private static includeRelations = {
        attachments: {where: {deletedAt: null}}
    }

    /**
     * Return the list of Posts
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.PostWhereInput): Promise<Post[]> {
        return prisma.post.findMany({
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
     * Return the number of elements stored
     * @param where query conditions
     */
    static async count(where?: Prisma.PostWhereInput): Promise<number> {
        return prisma.post.count({
            where: {
                deletedAt: null,
                ...where
            }
        });
    }

    /**
     * Return the specific element
     * @param id id of element
     * @param where query conditions
     */
    static async find(id: number, where?: Prisma.PostWhereInput): Promise<(Post & { attachments: StorageFile[] })> {
        const post = await prisma.post.findFirst({
            where: {id, deletedAt: null, ...where},
            include: this.includeRelations
        });

        if (!post) {
            throw new NotFoundException(id.toString());
        }

        return post;
    }

    /**
     * Check if specific Post exist
     * @param id id of element
     */
    static async exist(id: number): Promise<boolean> {
        return this.find(id).then(_ => true).catch(error => {
            if(error.status === 404) {
                return false;
            }
            throw new InternalServerErrorException("Argument id: invalid value");
        });
    }

    /**
     * Create a new Post
     * @param input the Post data
     */
    static async create(input: any): Promise<Post> {
        const data: Prisma.PostCreateInput = Prisma.validator<Prisma.PostCreateInput>()(input);
        return prisma.post.create({
            data,
            include: this.includeRelations
        });
    }

    /**
     * Update an Post
     * @param id id of element
     * @param data the Post data
     */
    static async update(id: number, data: Prisma.PostUpdateInput): Promise<(Post & { attachments: StorageFile[] })> {
        return prisma.post.update({
            where: {id},
            data,
            include: this.includeRelations
        });
    }

    /**
     * Soft delete an Post
     * @param id id of element
     */
    static async delete(id: number): Promise<Post> {
        return prisma.post.delete({where: {id}});
    }
}

