import express from "express";
import {wrap} from "async-middleware";
import UserController from "../../controllers/user-controller";
import UserValidation from "../../validations/user-validation";
import KeycloakHelper from "../../helpers/keycloak-helper";
import environment from "../../environment";

const userRouter = express.Router();
userRouter.get(
    '/',
    UserValidation.list,
    wrap(UserController.list)
);

userRouter.get(
    '/roles',
    KeycloakHelper.protect(environment.appRoles.admin),
    wrap(UserController.roles)
);

export default userRouter;
