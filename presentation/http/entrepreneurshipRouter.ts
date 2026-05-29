import express, { type Router } from "express";
import type { PaginateEntrepreneurshipUseCase } from "../../application/entrepreneurship/paginateEntrepreneurshipUseCase.js";
import type { GetEntrepreneurshipDetailUseCase } from "../../application/entrepreneurship/getEntrepreneurshipDetailUseCase.js";
import type { ListPublishedEntrepreneurshipUseCase } from "../../application/entrepreneurship/listPublishedEntrepreneurshipUseCase.js";
import type { GetPublishedEntrepreneurshipDetailUseCase } from "../../application/entrepreneurship/getPublishedEntrepreneurshipDetailUseCase.js";
import type { CreateEntrepreneurshipUseCase } from "../../application/entrepreneurship/createEntrepreneurshipUseCase.js";
import type { UpdateEntrepreneurshipUseCase } from "../../application/entrepreneurship/updateEntrepreneurshipUseCase.js";
import type { DeleteEntrepreneurshipUseCase } from "../../application/entrepreneurship/deleteEntrepreneurshipUseCase.js";
import { sendEntrepreneurshipOutcome } from "./entrepreneurshipHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { parseEntrepreneurshipMultipartImage } from "./parseEntrepreneurshipMultipartImage.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import { mongoIdParamSchema } from "./schemas/routeSchemas.js";
import {
  createEntrepreneurshipBodySchema,
  paginateEntrepreneurshipQuerySchema,
  updateEntrepreneurshipBodySchema,
  type CreateEntrepreneurshipBody,
  type PaginateEntrepreneurshipQuery,
  type UpdateEntrepreneurshipBody,
} from "./schemas/routeSchemasEntrepreneurship.js";

export type EntrepreneurshipRouterDeps = {
  auth: AuthMiddlewareFactory;
  paginateEntrepreneurship: PaginateEntrepreneurshipUseCase;
  getEntrepreneurshipDetail: GetEntrepreneurshipDetailUseCase;
  listPublishedEntrepreneurship: ListPublishedEntrepreneurshipUseCase;
  getPublishedEntrepreneurshipDetail: GetPublishedEntrepreneurshipDetailUseCase;
  createEntrepreneurship: CreateEntrepreneurshipUseCase;
  updateEntrepreneurship: UpdateEntrepreneurshipUseCase;
  deleteEntrepreneurship: DeleteEntrepreneurshipUseCase;
};

export function createEntrepreneurshipRouter(
  deps: EntrepreneurshipRouterDeps
): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get("/public", async (req, res) => {
    try {
      const outcome = await deps.listPublishedEntrepreneurship.execute();
      sendEntrepreneurshipOutcome(res, req, outcome);
    } catch (e: unknown) {
      console.log("[ERROR] -> listPublishedEntrepreneurship", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get(
    "/public/:id",
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const outcome = await deps.getPublishedEntrepreneurshipDetail.execute(
          req.params.id
        );
        sendEntrepreneurshipOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getPublishedEntrepreneurshipDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateEntrepreneurshipQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as PaginateEntrepreneurshipQuery;
        const outcome = await deps.paginateEntrepreneurship.execute({
          search: q.search,
          filter: q.filter,
          page: q.page,
          pageSize: q.pageSize,
          companyId: String(req.user!.company),
        });
        sendEntrepreneurshipOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> paginateEntrepreneurship", e);
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
        const outcome = await deps.getEntrepreneurshipDetail.execute(
          req.params.id,
          String(req.user!.company)
        );
        sendEntrepreneurshipOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getEntrepreneurshipDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.post(
    "/",
    auth(),
    parseEntrepreneurshipMultipartImage,
    validateBody(createEntrepreneurshipBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.createEntrepreneurship.execute(
          req.body as CreateEntrepreneurshipBody,
          String(req.user!._id),
          String(req.user!.company)
        );
        sendEntrepreneurshipOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> createEntrepreneurship", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    parseEntrepreneurshipMultipartImage,
    validateBody(updateEntrepreneurshipBodySchema),
    async (req, res) => {
      try {
        const outcome = await deps.updateEntrepreneurship.execute(
          req.body as UpdateEntrepreneurshipBody,
          String(req.user!.company),
          String(req.user!._id)
        );
        sendEntrepreneurshipOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateEntrepreneurship", e);
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
        const outcome = await deps.deleteEntrepreneurship.execute(
          req.params.id,
          String(req.user!.company)
        );
        switch (outcome.status) {
          case 200:
            res.status(200).send(`Entrevista ${req.params.id} eliminada`);
            break;
          case 400:
            res.status(outcome.status).send(outcome.message);
            break;
          default:
            sendEntrepreneurshipOutcome(res, req, outcome);
            break;
        }
      } catch (e: unknown) {
        console.log("[ERROR] -> deleteEntrepreneurship", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
