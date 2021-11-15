import {Request, Response} from "express";
import {convertNumbersToStorageFileUpdateMany} from "../helpers/prisma";
import {Post} from "@prisma/client";
import IPaginatedList from "../interfaces/paginated-list";
import {StatusCodes} from "http-status-codes";
import {matchedData} from "express-validator";
import PostService from "../services/post-service";
import KeycloakHelper from "../helpers/keycloak-helper";

export default class PostController {

    /**
     * Return the list of Posts
     * @param req the validated paginatedList request
     * @param res the response as a PaginatedList<Post>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const pageSize = Number(req.query.pageSize),
            currentPage = Number(req.query.currentPage);

        const totalItems = await PostService.count();
        const paginatedList: IPaginatedList<Post> = {
            pageSize, currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
            contentList: await PostService.list(currentPage, pageSize)
        };

        res.send(paginatedList);
    }

    /**
     * Find a Post resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a Post
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await PostService.find(Number(id)));
    }

    /**
     * Create a new instance of Post
     * @param req the validated Post\create request
     * @param res the response as a Post
     */
    static async create(req: Request, res: Response): Promise<void> {
        let bodyData = matchedData(req, {locations: ['body']}); // Get only validated params

        if (Array.isArray(bodyData.attachmentIds)) {
            bodyData.attachments = convertNumbersToStorageFileUpdateMany(bodyData.attachmentIds);
            delete bodyData.attachmentIds;
        }

        const currentUser = KeycloakHelper.getCurrentUser(req)!;
        bodyData.keycloakId = currentUser.id;

        const post = await PostService.create(bodyData);
        res.status(StatusCodes.CREATED).send(post);
    }

    /**
     * Update an instance of Post
     * @param req the validated Post\update request
     * @param res the response as a Post
     */
    static async update(req: Request, res: Response): Promise<void> {
        const {id} = req.params;

        const post = await PostService.find(Number(id));
        const bodyData = matchedData(req, {locations: ['body']}); // Get only validated params

        if (Array.isArray(bodyData.attachmentIds)) {
            bodyData.attachments = convertNumbersToStorageFileUpdateMany(bodyData.attachmentIds, post.attachments);
            delete bodyData.attachmentIds;
        }

        res.send(await PostService.update(post.id, bodyData));
    }

    /**
     * Soft delete an instance of Post
     * @param req the validated onlyIdParam request
     * @param res the response as a Post
     */
    static async delete(req: Request, res: Response): Promise<void> {
        const {id} = req.params;

        const post = await PostService.find(Number(id));
        res.send(await PostService.delete(post.id));
    }
}
