import express, { type Router } from "express";
import type { PaginateMultimediaUseCase } from "../../application/multimedia/paginateMultimediaUseCase.js";
import type { GetMultimediaDetailUseCase } from "../../application/multimedia/getMultimediaDetailUseCase.js";
import type { ListPublishedMultimediaUseCase } from "../../application/multimedia/listPublishedMultimediaUseCase.js";
import type { GetPublishedMultimediaDetailUseCase } from "../../application/multimedia/getPublishedMultimediaDetailUseCase.js";
import type { CreateMultimediaUseCase } from "../../application/multimedia/createMultimediaUseCase.js";
import type { UpdateMultimediaUseCase } from "../../application/multimedia/updateMultimediaUseCase.js";
import type { DeleteMultimediaUseCase } from "../../application/multimedia/deleteMultimediaUseCase.js";
import { sendMultimediaOutcome } from "./multimediaHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { parseMultimediaMultipart } from "./parseMultimediaMultipart.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import {
  createMultimediaBodySchema,
  paginateMultimediaQuerySchema,
  updateMultimediaBodySchema,
  type CreateMultimediaBody,
  type PaginateMultimediaQuery,
  type UpdateMultimediaBody,
} from "./schemas/routeSchemasMultimedia.js";

export type MultimediaRouterDeps = {
  auth: AuthMiddlewareFactory;
  paginateMultimedia: PaginateMultimediaUseCase;
  getMultimediaDetail: GetMultimediaDetailUseCase;
  listPublishedMultimedia: ListPublishedMultimediaUseCase;
  getPublishedMultimediaDetail: GetPublishedMultimediaDetailUseCase;
  createMultimedia: CreateMultimediaUseCase;
  updateMultimedia: UpdateMultimediaUseCase;
  deleteMultimedia: DeleteMultimediaUseCase;
};

export function createMultimediaRouter(deps: MultimediaRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get("/public", async (req, res) => {
    try {
      const outcome = await deps.listPublishedMultimedia.execute();
      sendMultimediaOutcome(res, req, outcome);
    } catch (e: unknown) {
      console.log("[ERROR] -> listPublishedMultimedia", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get(
    "/public/:id",
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.getPublishedMultimediaDetail.execute(
          req.params.id
        );
        sendMultimediaOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getPublishedMultimediaDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateMultimediaQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as PaginateMultimediaQuery;
        const outcome = await deps.paginateMultimedia.execute({
          search: q.search,
          filter: q.filter,
          type: q.type,
          status: q.status,
          page: q.page,
          pageSize: q.pageSize,
          companyId: String(req.user!.company),
        });
        sendMultimediaOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> paginateMultimedia", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/:id",
    auth(),
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.getMultimediaDetail.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendMultimediaOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getMultimediaDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.post(
    "/",
    auth(),
    parseMultimediaMultipart,
    validateBody(createMultimediaBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.createMultimedia.execute(
          req.body as CreateMultimediaBody,
          String(req.user!._id),
          String(req.user!.company)
        );
        sendMultimediaOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createMultimedia", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    parseMultimediaMultipart,
    validateBody(updateMultimediaBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.updateMultimedia.execute(
          req.body as UpdateMultimediaBody,
          String(req.user!.company),
          String(req.user!._id)
        );
        sendMultimediaOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateMultimedia", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.delete(
    "/:id",
    auth(),
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.deleteMultimedia.execute(
          req.params.id,
          String(req.user!.company)
        );
        switch (outcome.status) {
          case 200:
            res.status(200).send(`Contenido ${req.params.id} eliminado`);
            break;
          case 400:
            res.status(outcome.status).send(outcome.message);
            break;
          default:
            sendMultimediaOutcome(res, req, outcome);
            break;
        }
      } catch (e: unknown) {
        console.log("[ERROR] -> deleteMultimedia", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
