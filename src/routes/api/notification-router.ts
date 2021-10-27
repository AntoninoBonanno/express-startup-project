import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import NotificationValidation from "../../validations/notification-validation";
import NotificationController from "../../controllers/notification-controller";

const notificationRouter = express.Router();
notificationRouter.get(
    '/',
    GeneralValidation.paginatedList,
    wrap(NotificationController.list)
);

notificationRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(NotificationController.findById)
);

notificationRouter.post(
    '/',
    NotificationValidation.create,
    wrap(NotificationController.create)
);

notificationRouter.put(
    '/:id',
    NotificationValidation.update,
    wrap(NotificationController.update)
);

notificationRouter.delete(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(NotificationController.delete)
);

export default notificationRouter;
