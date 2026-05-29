import express, { type Router } from "express";
import type { PaginateLiveEventsUseCase } from "../../application/live-events/paginateLiveEventsUseCase.js";
import type { GetLiveEventDetailUseCase } from "../../application/live-events/getLiveEventDetailUseCase.js";
import type { ListPublicLiveEventsUseCase } from "../../application/live-events/listPublicLiveEventsUseCase.js";
import type { GetPublicLiveEventDetailUseCase } from "../../application/live-events/getPublicLiveEventDetailUseCase.js";
import type { CreateLiveEventUseCase } from "../../application/live-events/createLiveEventUseCase.js";
import type { UpdateLiveEventUseCase } from "../../application/live-events/updateLiveEventUseCase.js";
import type { DeleteLiveEventUseCase } from "../../application/live-events/deleteLiveEventUseCase.js";
import { sendLiveEventOutcome } from "./liveEventsHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { parseLiveEventMultipartImage } from "./parseLiveEventMultipartImage.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import {
  createLiveEventBodySchema,
  paginateLiveEventsQuerySchema,
  updateLiveEventBodySchema,
  type CreateLiveEventBody,
  type PaginateLiveEventsQuery,
  type UpdateLiveEventBody,
} from "./schemas/routeSchemasLiveEvents.js";

export type LiveEventsRouterDeps = {
  auth: AuthMiddlewareFactory;
  paginateLiveEvents: PaginateLiveEventsUseCase;
  getLiveEventDetail: GetLiveEventDetailUseCase;
  listPublicLiveEvents: ListPublicLiveEventsUseCase;
  getPublicLiveEventDetail: GetPublicLiveEventDetailUseCase;
  createLiveEvent: CreateLiveEventUseCase;
  updateLiveEvent: UpdateLiveEventUseCase;
  deleteLiveEvent: DeleteLiveEventUseCase;
};

export function createLiveEventsRouter(deps: LiveEventsRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get("/public", async (req, res) => {
    try {
      const outcome = await deps.listPublicLiveEvents.execute();
      sendLiveEventOutcome(res, req, outcome);
    } catch (e: unknown) {
      console.log("[ERROR] -> listPublicLiveEvents", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get(
    "/public/:id",
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.getPublicLiveEventDetail.execute(
          req.params.id
        );
        sendLiveEventOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getPublicLiveEventDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateLiveEventsQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as PaginateLiveEventsQuery;
        const outcome = await deps.paginateLiveEvents.execute({
          search: q.search,
          filter: q.filter,
          type: q.type,
          status: q.status,
          page: q.page,
          pageSize: q.pageSize,
          companyId: String(req.user!.company),
        });
        sendLiveEventOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> paginateLiveEvents", e);
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
        const outcome = await deps.getLiveEventDetail.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendLiveEventOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getLiveEventDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.post(
    "/",
    auth(),
    parseLiveEventMultipartImage,
    validateBody(createLiveEventBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.createLiveEvent.execute(
          req.body as CreateLiveEventBody,
          String(req.user!._id),
          String(req.user!.company)
        );
        sendLiveEventOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createLiveEvent", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    parseLiveEventMultipartImage,
    validateBody(updateLiveEventBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.updateLiveEvent.execute(
          req.body as UpdateLiveEventBody,
          String(req.user!.company),
          String(req.user!._id)
        );
        sendLiveEventOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateLiveEvent", e);
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
        const outcome = await deps.deleteLiveEvent.execute(
          req.params.id,
          String(req.user!.company)
        );
        switch (outcome.status) {
          case 200:
            res.status(200).send(`Evento ${req.params.id} eliminado`);
            break;
          case 400:
            res.status(outcome.status).send(outcome.message);
            break;
          default:
            sendLiveEventOutcome(res, req, outcome);
            break;
        }
      } catch (e: unknown) {
        console.log("[ERROR] -> deleteLiveEvent", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
