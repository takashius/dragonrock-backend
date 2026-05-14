import express, { type Router } from "express";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import type { UploadMediaUseCase } from "../../application/media/uploadMediaUseCase.js";
import type { DeleteMediaUseCase } from "../../application/media/deleteMediaUseCase.js";
import { validateBody } from "./validateRequest.js";
import {
  deleteMediaBodySchema,
  uploadMediaBodySchema,
  type DeleteMediaBody,
  type UploadMediaBody,
} from "./schemas/routeSchemas.js";
import { sendMediaOutcome } from "./mediaHttpMapper.js";

export type MediaRouterDeps = {
  auth: AuthMiddlewareFactory;
  enabled: boolean;
  uploadMedia?: UploadMediaUseCase;
  deleteMedia?: DeleteMediaUseCase;
};

export function createMediaRouter(deps: MediaRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  if (!deps.enabled || !deps.uploadMedia || !deps.deleteMedia) {
    router.post("/upload", auth(), (_req, res) => {
      res.status(503).send("Cloudinary no está configurado en el servidor.");
    });
    router.post("/destroy", auth(), (_req, res) => {
      res.status(503).send("Cloudinary no está configurado en el servidor.");
    });
    return router;
  }

  router.post(
    "/upload",
    auth(),
    validateBody(uploadMediaBodySchema),
    async (req, res) => {
      const result = await deps.uploadMedia!.execute(req.body as UploadMediaBody);
      sendMediaOutcome(res, req, result);
    }
  );

  router.post(
    "/destroy",
    auth(),
    validateBody(deleteMediaBodySchema),
    async (req, res) => {
      const result = await deps.deleteMedia!.execute(req.body as DeleteMediaBody);
      sendMediaOutcome(res, req, result);
    }
  );

  return router;
}
