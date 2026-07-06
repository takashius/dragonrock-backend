import express, { type Router } from "express";
import type { PaginateStoreCategoriesUseCase } from "../../application/storeCategories/paginateStoreCategoriesUseCase.js";
import type { GetStoreCategoryDetailUseCase } from "../../application/storeCategories/getStoreCategoryDetailUseCase.js";
import type { ListSimpleStoreCategoriesUseCase } from "../../application/storeCategories/listSimpleStoreCategoriesUseCase.js";
import type { ListPublicStoreCategoriesUseCase } from "../../application/storeCategories/listPublicStoreCategoriesUseCase.js";
import type { CreateStoreCategoryUseCase } from "../../application/storeCategories/createStoreCategoryUseCase.js";
import type { UpdateStoreCategoryUseCase } from "../../application/storeCategories/updateStoreCategoryUseCase.js";
import type { DeleteStoreCategoryUseCase } from "../../application/storeCategories/deleteStoreCategoryUseCase.js";
import { sendStoreCategoryOutcome } from "./storeCategoriesHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { parseStoreCategoryMultipartImage } from "./parseStoreCategoryMultipartImage.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import {
  createStoreCategoryBodySchema,
  paginateStoreCategoriesQuerySchema,
  updateStoreCategoryBodySchema,
  type CreateStoreCategoryBody,
  type PaginateStoreCategoriesQuery,
  type UpdateStoreCategoryBody,
} from "./schemas/routeSchemasStoreCategories.js";

export type StoreCategoriesRouterDeps = {
  auth: AuthMiddlewareFactory;
  paginateStoreCategories: PaginateStoreCategoriesUseCase;
  getStoreCategoryDetail: GetStoreCategoryDetailUseCase;
  listSimpleStoreCategories: ListSimpleStoreCategoriesUseCase;
  listPublicStoreCategories: ListPublicStoreCategoriesUseCase;
  createStoreCategory: CreateStoreCategoryUseCase;
  updateStoreCategory: UpdateStoreCategoryUseCase;
  deleteStoreCategory: DeleteStoreCategoryUseCase;
};

export function createStoreCategoriesRouter(
  deps: StoreCategoriesRouterDeps
): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get("/public", async (req, res) => {
    try {
      const outcome = await deps.listPublicStoreCategories.execute();
      sendStoreCategoryOutcome(res, req, outcome);
    } catch (e: unknown) {
      console.log("[ERROR] -> listPublicStoreCategories", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get("/simple", auth(), async (req, res) => {
    try {
      const outcome = await deps.listSimpleStoreCategories.execute(
        String(req.user!.company)
      );
      sendStoreCategoryOutcome(res, req, outcome);
    } catch (e: unknown) {
      console.log("[ERROR] -> listSimpleStoreCategories", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateStoreCategoriesQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as PaginateStoreCategoriesQuery;
        const outcome = await deps.paginateStoreCategories.execute({
          search: q.search,
          filter: q.filter,
          status: q.status,
          page: q.page,
          pageSize: q.pageSize,
          companyId: String(req.user!.company),
        });
        sendStoreCategoryOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> paginateStoreCategories", e);
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
        const outcome = await deps.getStoreCategoryDetail.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendStoreCategoryOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getStoreCategoryDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.post(
    "/",
    auth(),
    parseStoreCategoryMultipartImage,
    validateBody(createStoreCategoryBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.createStoreCategory.execute(
          req.body as CreateStoreCategoryBody,
          String(req.user!._id),
          String(req.user!.company)
        );
        sendStoreCategoryOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createStoreCategory", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    parseStoreCategoryMultipartImage,
    validateBody(updateStoreCategoryBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.updateStoreCategory.execute(
          req.body as UpdateStoreCategoryBody,
          String(req.user!.company),
          String(req.user!._id)
        );
        sendStoreCategoryOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateStoreCategory", e);
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
        const outcome = await deps.deleteStoreCategory.execute(
          req.params.id,
          String(req.user!.company)
        );
        switch (outcome.status) {
          case 200:
            res.status(200).send(`Categoría ${req.params.id} eliminada`);
            break;
          case 400:
            res.status(outcome.status).send(outcome.message);
            break;
          default:
            sendStoreCategoryOutcome(res, req, outcome);
            break;
        }
      } catch (e: unknown) {
        console.log("[ERROR] -> deleteStoreCategory", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
