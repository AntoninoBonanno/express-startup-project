import express from "express";
import {wrap} from "async-middleware";
import PostValidation from "../../validations/post-validation";
import GeneralValidation from "../../validations/shared/general-validation";
import PostController from "../../controllers/post-controller";

const postRouter = express.Router();
postRouter.get(
    '/',
    GeneralValidation.paginatedList,
    wrap(PostController.list)
);

postRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(PostController.findById)
);

postRouter.post(
    '/',
    PostValidation.create,
    wrap(PostController.create)
);

postRouter.put(
    '/:id',
    PostValidation.update,
    wrap(PostController.update)
);

postRouter.delete(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(PostController.delete)
);

export default postRouter;
