import {Request, Response} from "express";
import IPaginatedList from "../interfaces/paginated-list";
import {StatusCodes} from "http-status-codes";
import {matchedData} from "express-validator";
import {Notification} from "@prisma/client";
import NotificationService from "../services/notification-service";
import {ioSocket} from "../app";

export default class NotificationController {

    /**
     * Return the list of Notifications
     * @param req the validated paginatedList request
     * @param res the response as a PaginatedList<Notification>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const pageSize = Number(req.query.pageSize),
            currentPage = Number(req.query.currentPage);

        const totalItems = await NotificationService.count();
        const paginatedList: IPaginatedList<Notification> = {
            pageSize, currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
            contentList: await NotificationService.list(currentPage, pageSize)
        };

        res.send(paginatedList);
    }

    /**
     * Find a Notification resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a Notification
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await NotificationService.find(Number(id)));
    }

    /**
     * Create a new instance of Notification
     * @param req the validated Notification\create request
     * @param res the response as a Notification
     */
    static async create(req: Request, res: Response): Promise<void> {
        let bodyData = matchedData(req, {locations: ['body']}); // Get only validated params

        const notification = await NotificationService.create(bodyData);
        ioSocket.emitAuthenticated('new-notification', notification); // Fire 'new-notification' event to authenticated clients
        res.status(StatusCodes.CREATED).send(notification);
    }

    /**
     * Update an instance of Notification
     * @param req the validated Notification\update request
     * @param res the response as a Notification
     */
    static async update(req: Request, res: Response): Promise<void> {
        const {id} = req.params;

        const notification = await NotificationService.find(Number(id));
        const bodyData = matchedData(req, {locations: ['body']}); // Get only validated params

        const updatedNotification = await NotificationService.update(notification.id, bodyData);
        if (!updatedNotification.read) {
            ioSocket.emitAuthenticated('updated-notification', updatedNotification); // Fire 'updated-notification' event to authenticated clients
        }
        res.send(updatedNotification);
    }

    /**
     * Soft delete an instance of Notification
     * @param req the validated onlyIdParam request
     * @param res the response as a Notification
     */
    static async delete(req: Request, res: Response): Promise<void> {
        const {id} = req.params;

        const notification = await NotificationService.find(Number(id));
        res.send(await NotificationService.delete(notification.id));
    }
}
