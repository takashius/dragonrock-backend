import express, { type Router } from "express";
import type { PaginateStoreProductsUseCase } from "../../application/storeProducts/paginateStoreProductsUseCase.js";
import type { GetStoreProductDetailUseCase } from "../../application/storeProducts/getStoreProductDetailUseCase.js";
import type { ListPublicStoreProductsUseCase } from "../../application/storeProducts/listPublicStoreProductsUseCase.js";
import type { GetPublicStoreProductDetailUseCase } from "../../application/storeProducts/getPublicStoreProductDetailUseCase.js";
import type { GetPublicStoreProductBySlugUseCase } from "../../application/storeProducts/getPublicStoreProductBySlugUseCase.js";
import type { CreateStoreProductUseCase } from "../../application/storeProducts/createStoreProductUseCase.js";
import type { UpdateStoreProductUseCase } from "../../application/storeProducts/updateStoreProductUseCase.js";
import type { DeleteStoreProductUseCase } from "../../application/storeProducts/deleteStoreProductUseCase.js";
import { sendStoreProductOutcome } from "./storeProductsHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { parseStoreProductMultipart } from "./parseStoreProductMultipart.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import {
  createStoreProductBodySchema,
  paginateStoreProductsQuerySchema,
  listPublicStoreProductsQuerySchema,
  productSlugParamSchema,
  updateStoreProductBodySchema,
  type CreateStoreProductBody,
  type PaginateStoreProductsQuery,
  type ListPublicStoreProductsQuery,
  type UpdateStoreProductBody,
} from "./schemas/routeSchemasStoreProducts.js";

export type StoreProductsRouterDeps = {
  auth: AuthMiddlewareFactory;
  paginateStoreProducts: PaginateStoreProductsUseCase;
  getStoreProductDetail: GetStoreProductDetailUseCase;
  listPublicStoreProducts: ListPublicStoreProductsUseCase;
  getPublicStoreProductDetail: GetPublicStoreProductDetailUseCase;
  getPublicStoreProductBySlug: GetPublicStoreProductBySlugUseCase;
  createStoreProduct: CreateStoreProductUseCase;
  updateStoreProduct: UpdateStoreProductUseCase;
  deleteStoreProduct: DeleteStoreProductUseCase;
};

export function createStoreProductsRouter(
  deps: StoreProductsRouterDeps
): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get(
    "/public",
    validateQuery(listPublicStoreProductsQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as ListPublicStoreProductsQuery;
        const outcome = await deps.listPublicStoreProducts.execute({
          search: q.search,
          category: q.category,
          page: q.page,
          pageSize: q.pageSize,
        });
        sendStoreProductOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> listPublicStoreProducts", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/public/slug/:slug",
    validateParams(productSlugParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.getPublicStoreProductBySlug.execute(
          req.params.slug
        );
        sendStoreProductOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getPublicStoreProductBySlug", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/public/:id",
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.getPublicStoreProductDetail.execute(
          req.params.id
        );
        sendStoreProductOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getPublicStoreProductDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateStoreProductsQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as PaginateStoreProductsQuery;
        const outcome = await deps.paginateStoreProducts.execute({
          search: q.search,
          filter: q.filter,
          category: q.category,
          status: q.status,
          page: q.page,
          pageSize: q.pageSize,
          companyId: String(req.user!.company),
        });
        sendStoreProductOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> paginateStoreProducts", e);
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
        const outcome = await deps.getStoreProductDetail.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendStoreProductOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getStoreProductDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.post(
    "/",
    auth(),
    parseStoreProductMultipart,
    validateBody(createStoreProductBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.createStoreProduct.execute(
          req.body as CreateStoreProductBody,
          String(req.user!._id),
          String(req.user!.company)
        );
        sendStoreProductOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createStoreProduct", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    parseStoreProductMultipart,
    validateBody(updateStoreProductBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.updateStoreProduct.execute(
          req.body as UpdateStoreProductBody,
          String(req.user!.company),
          String(req.user!._id)
        );
        sendStoreProductOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateStoreProduct", e);
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
        const outcome = await deps.deleteStoreProduct.execute(
          req.params.id,
          String(req.user!.company)
        );
        switch (outcome.status) {
          case 200:
            res.status(200).send(`Producto ${req.params.id} eliminado`);
            break;
          case 400:
            res.status(outcome.status).send(outcome.message);
            break;
          default:
            sendStoreProductOutcome(res, req, outcome);
            break;
        }
      } catch (e: unknown) {
        console.log("[ERROR] -> deleteStoreProduct", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
