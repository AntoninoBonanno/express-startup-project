import prisma from "../helpers/prisma";
import {Notification, Prisma} from "@prisma/client";
import {InternalServerErrorException, NotFoundException} from "../exceptions/http-exceptions";

export default class NotificationService {

    /**
     * Return the list of Notifications
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.NotificationWhereInput): Promise<Notification[]> {
        return prisma.notification.findMany({
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
    static async count(where?: Prisma.NotificationWhereInput): Promise<number> {
        return prisma.notification.count({
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
    static async find(id: number, where?: Prisma.NotificationWhereInput): Promise<Notification> {
        const notification = await prisma.notification.findFirst({
            where: {id, deletedAt: null, ...where}
        });

        if (!notification) {
            throw new NotFoundException(id.toString());
        }

        return notification;
    }

    /**
     * Check if specific Notification exist
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
     * Create a new Notification
     * @param input the Notification data
     */
    static async create(input: any): Promise<Notification> {
        const data: Prisma.NotificationCreateInput = Prisma.validator<Prisma.NotificationCreateInput>()(input);
        return prisma.notification.create({data});
    }

    /**
     * Update an Notification
     * @param id id of element
     * @param data the Notification data
     */
    static async update(id: number, data: Prisma.NotificationUpdateInput): Promise<Notification> {
        return prisma.notification.update({
            where: {id},
            data
        });
    }

    /**
     * Soft delete an Notification
     * @param id id of element
     */
    static async delete(id: number): Promise<Notification> {
        return prisma.notification.delete({where: {id}});
    }
}

