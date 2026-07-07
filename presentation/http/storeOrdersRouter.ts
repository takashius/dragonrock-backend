import express, { type Router } from "express";
import type { CreatePublicStoreOrderUseCase } from "../../application/storeOrders/createPublicStoreOrderUseCase.js";
import type { PaginateStoreOrdersUseCase } from "../../application/storeOrders/paginateStoreOrdersUseCase.js";
import type { GetStoreOrderDetailUseCase } from "../../application/storeOrders/getStoreOrderDetailUseCase.js";
import type { UpdateStoreOrderUseCase } from "../../application/storeOrders/updateStoreOrderUseCase.js";
import { sendStoreOrderOutcome } from "./storeOrdersHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import { sensitivePublicRateLimiter } from "./rateLimiters.js";
import {
  createPublicStoreOrderBodySchema,
  paginateStoreOrdersQuerySchema,
  updateStoreOrderBodySchema,
  type CreatePublicStoreOrderBody,
  type PaginateStoreOrdersQuery,
  type UpdateStoreOrderBody,
} from "./schemas/routeSchemasStoreOrders.js";

export type StoreOrdersRouterDeps = {
  auth: AuthMiddlewareFactory;
  createPublicStoreOrder: CreatePublicStoreOrderUseCase;
  paginateStoreOrders: PaginateStoreOrdersUseCase;
  getStoreOrderDetail: GetStoreOrderDetailUseCase;
  updateStoreOrder: UpdateStoreOrderUseCase;
};

export function createStoreOrdersRouter(deps: StoreOrdersRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  router.post(
    "/public",
    validateBody(createPublicStoreOrderBodySchema),
    sensitivePublicRateLimiter,
    async (req, res) => {
      try {
        const body = req.body as CreatePublicStoreOrderBody;
        const outcome = await deps.createPublicStoreOrder.execute({
          customer: body.customer,
          items: body.items,
          notes: body.notes,
        });
        sendStoreOrderOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createPublicStoreOrder", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateStoreOrdersQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as PaginateStoreOrdersQuery;
        const outcome = await deps.paginateStoreOrders.execute({
          search: q.search,
          filter: q.filter,
          status: q.status,
          page: q.page ?? "1",
          pageSize: q.pageSize,
          companyId: String(req.user!.company),
        });
        sendStoreOrderOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> paginateStoreOrders", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    validateBody(updateStoreOrderBodySchema),
    async (req, res) => {
      try {
        const body = req.body as UpdateStoreOrderBody;
        const outcome = await deps.updateStoreOrder.execute(
          { id: body.id, status: body.status },
          String(req.user!.company)
        );
        sendStoreOrderOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateStoreOrder", e);
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
        const outcome = await deps.getStoreOrderDetail.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendStoreOrderOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getStoreOrderDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
