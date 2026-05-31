import express, { type Router } from "express";
import type { PaginateServicesUseCase } from "../../application/services/paginateServicesUseCase.js";
import type { GetServiceDetailUseCase } from "../../application/services/getServiceDetailUseCase.js";
import type { ListPublishedServicesUseCase } from "../../application/services/listPublishedServicesUseCase.js";
import type { GetPublishedServiceDetailUseCase } from "../../application/services/getPublishedServiceDetailUseCase.js";
import type { CreateServiceUseCase } from "../../application/services/createServiceUseCase.js";
import type { UpdateServiceUseCase } from "../../application/services/updateServiceUseCase.js";
import type { DeleteServiceUseCase } from "../../application/services/deleteServiceUseCase.js";
import { sendServiceOutcome } from "./servicesHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { parseServiceMultipartImage } from "./parseServiceMultipartImage.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import {
  createServiceBodySchema,
  paginateServicesQuerySchema,
  updateServiceBodySchema,
  type CreateServiceBody,
  type PaginateServicesQuery,
  type UpdateServiceBody,
} from "./schemas/routeSchemasServices.js";

export type ServicesRouterDeps = {
  auth: AuthMiddlewareFactory;
  paginateServices: PaginateServicesUseCase;
  getServiceDetail: GetServiceDetailUseCase;
  listPublishedServices: ListPublishedServicesUseCase;
  getPublishedServiceDetail: GetPublishedServiceDetailUseCase;
  createService: CreateServiceUseCase;
  updateService: UpdateServiceUseCase;
  deleteService: DeleteServiceUseCase;
};

export function createServicesRouter(deps: ServicesRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get("/public", async (req, res) => {
    try {
      const outcome = await deps.listPublishedServices.execute();
      sendServiceOutcome(res, req, outcome);
    } catch (e: unknown) {
      console.log("[ERROR] -> listPublishedServices", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get(
    "/public/:id",
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.getPublishedServiceDetail.execute(
          req.params.id
        );
        sendServiceOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getPublishedServiceDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateServicesQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as PaginateServicesQuery;
        const outcome = await deps.paginateServices.execute({
          search: q.search,
          filter: q.filter,
          category: q.category,
          status: q.status,
          page: q.page,
          pageSize: q.pageSize,
          companyId: String(req.user!.company),
        });
        sendServiceOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> paginateServices", e);
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
        const outcome = await deps.getServiceDetail.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendServiceOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getServiceDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.post(
    "/",
    auth(),
    parseServiceMultipartImage,
    validateBody(createServiceBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.createService.execute(
          req.body as CreateServiceBody,
          String(req.user!._id),
          String(req.user!.company)
        );
        sendServiceOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createService", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    parseServiceMultipartImage,
    validateBody(updateServiceBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.updateService.execute(
          req.body as UpdateServiceBody,
          String(req.user!.company),
          String(req.user!._id)
        );
        sendServiceOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateService", e);
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
        const outcome = await deps.deleteService.execute(
          req.params.id,
          String(req.user!.company)
        );
        switch (outcome.status) {
          case 200:
            res.status(200).send(`Servicio ${req.params.id} eliminado`);
            break;
          case 400:
            res.status(outcome.status).send(outcome.message);
            break;
          default:
            sendServiceOutcome(res, req, outcome);
            break;
        }
      } catch (e: unknown) {
        console.log("[ERROR] -> deleteService", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
