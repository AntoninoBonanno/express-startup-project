import express, {Request, Response} from 'express';
import {NotFoundException} from "../exceptions/http-exceptions";
import IStatusMessage from "../interfaces/status-message";
import KeycloakHelper from "../helpers/keycloak-helper";
import environment from "../environment";
import userRouter from "./api/user-router";
import notificationRouter from "./api/notification-router";
import storageFileRouter from "./api/storage_file-router";
import postRouter from "./api/post-router";

/** API Routes **/
const apiRouter = express.Router();
apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/storage-files', storageFileRouter);
apiRouter.use('/notifications', KeycloakHelper.protect(environment.appRoles.admin), notificationRouter);

/** BASE Routes **/
const rootRouter = express.Router();
rootRouter.get('/', (req: Request, res: Response): void => {
    res.send({status: 200, message: `${environment.appName} is alive!`} as IStatusMessage);
});

rootRouter.use('/api', KeycloakHelper.protect(), apiRouter);

rootRouter.get('*', (req: Request) => {
    throw new NotFoundException(`Cannot ${req.method} ${req.path}`, false);
});

export default rootRouter;
