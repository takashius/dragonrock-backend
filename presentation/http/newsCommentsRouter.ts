import express, { type Router } from "express";
import type { ListPublishedNewsCommentsUseCase } from "../../application/newsComments/listPublishedNewsCommentsUseCase.js";
import type { CreatePublicNewsCommentUseCase } from "../../application/newsComments/createPublicNewsCommentUseCase.js";
import type { DeleteNewsCommentUseCase } from "../../application/newsComments/deleteNewsCommentUseCase.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { sendNewsCommentOutcome } from "./newsCommentHttpMapper.js";
import { validateBody, validateParams } from "./validateRequest.js";
import { sensitivePublicRateLimiter } from "./rateLimiters.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import {
  createPublicNewsCommentBodySchema,
  type CreatePublicNewsCommentBody,
} from "./schemas/routeSchemasNewsComments.js";

export type NewsCommentsRouterDeps = {
  auth: AuthMiddlewareFactory;
  listPublishedNewsComments: ListPublishedNewsCommentsUseCase;
  createPublicNewsComment: CreatePublicNewsCommentUseCase;
  deleteNewsComment: DeleteNewsCommentUseCase;
};

export function createNewsCommentsRouter(
  deps: NewsCommentsRouterDeps
): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get(
    "/public/:id/comments",
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.listPublishedNewsComments.execute(
          req.params.id
        );
        sendNewsCommentOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> listPublishedNewsComments", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.post(
    "/public/:id/comments",
    validateParams(mongoIdParamSchema),
    validateBody(createPublicNewsCommentBodySchema),
    sensitivePublicRateLimiter,
    async (req, res) => {
      try {
        const body = req.body as CreatePublicNewsCommentBody;
        const outcome = await deps.createPublicNewsComment.execute({
          newsId: req.params.id,
          name: body.name,
          body: body.body,
          captchaToken: body.captchaToken,
          remoteIp: req.ip,
        });
        sendNewsCommentOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createPublicNewsComment", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.delete(
    "/comments/:id",
    auth(),
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.deleteNewsComment.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendNewsCommentOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> deleteNewsComment", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
