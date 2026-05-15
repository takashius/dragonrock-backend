import express, { type Router } from "express";
import type { ListNewsUseCase } from "../../application/news/listNewsUseCase.js";
import type { GetNewsDetailUseCase } from "../../application/news/getNewsDetailUseCase.js";
import type { ListPublishedNewsUseCase } from "../../application/news/listPublishedNewsUseCase.js";
import type { GetPublishedNewsDetailUseCase } from "../../application/news/getPublishedNewsDetailUseCase.js";
import type { PaginateNewsUseCase } from "../../application/news/paginateNewsUseCase.js";
import type { CreateNewsUseCase } from "../../application/news/createNewsUseCase.js";
import type { UpdateNewsUseCase } from "../../application/news/updateNewsUseCase.js";
import type { DeleteNewsUseCase } from "../../application/news/deleteNewsUseCase.js";
import { sendNewsOutcome } from "./newsHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { parseNewsMultipartImage } from "./parseNewsMultipartImage.js";
import { validateBody, validateParams, validateQuery } from "./validateRequest.js";
import {
  createNewsBodySchema,
  mongoIdParamSchema,
  paginateNewsQuerySchema,
  updateNewsBodySchema,
  type CreateNewsBody,
  type PaginateNewsQuery,
  type UpdateNewsBody,
} from "./schemas/routeSchemas.js";

export type NewsRouterDeps = {
  auth: AuthMiddlewareFactory;
  listNews: ListNewsUseCase;
  getNewsDetail: GetNewsDetailUseCase;
  listPublishedNews: ListPublishedNewsUseCase;
  getPublishedNewsDetail: GetPublishedNewsDetailUseCase;
  paginateNews: PaginateNewsUseCase;
  createNews: CreateNewsUseCase;
  updateNews: UpdateNewsUseCase;
  deleteNews: DeleteNewsUseCase;
};

export function createNewsRouter(deps: NewsRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get("/", auth(), async (req, res) => {
    try {
      const news = await deps.listNews.execute(String(req.user!.company));
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> getNews", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get("/public", async (req, res) => {
    try {
      const news = await deps.listPublishedNews.execute();
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> listPublishedNews", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get(
    "/public/:id",
    validateParams(mongoIdParamSchema),
    async (req, res) => {
      try {
        const news = await deps.getPublishedNewsDetail.execute(req.params.id);
        sendNewsOutcome(res, req, news);
      } catch (e: unknown) {
        console.log("[ERROR] -> getPublishedNewsDetail", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.get(
    "/paginate",
    auth(),
    validateQuery(paginateNewsQuerySchema),
    async (req, res) => {
    try {
      const q = req.validatedQuery as PaginateNewsQuery;
      const news = await deps.paginateNews.execute({
        search: q.search,
        filter: q.filter,
        type: q.type,
        page: q.page,
        pageSize: q.pageSize,
        companyId: String(req.user!.company),
      });
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> paginateNews", e);
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
      const news = await deps.getNewsDetail.execute(
        req.params.id,
        String(req.user!.company)
      );
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> getNewsDetail", e);
      res.status(500).send("Unexpected Error");
    }
  }
  );

  router.post(
    "/",
    auth(),
    parseNewsMultipartImage,
    validateBody(createNewsBodySchema),
    async (req, res) => {
      try {
        const news = await deps.createNews.execute(
          req.body as CreateNewsBody,
          String(req.user!._id),
          String(req.user!.company)
        );
        sendNewsOutcome(res, req, news);
      } catch (e: unknown) {
        console.log("[ERROR] -> addNews", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  router.patch(
    "/",
    auth(),
    parseNewsMultipartImage,
    validateBody(updateNewsBodySchema),
    async (req, res) => {
      try {
        const news = await deps.updateNews.execute(
          req.body as UpdateNewsBody,
          String(req.user!.company),
          String(req.user!._id)
        );
        sendNewsOutcome(res, req, news);
      } catch (e: unknown) {
        console.log("[ERROR] -> updateNews", e);
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
      const news = await deps.deleteNews.execute(
        req.params.id,
        String(req.user!.company)
      );
      switch (news.status) {
        case 200:
          res.status(200).send(`Noticia ${req.params.id} eliminada`);
          break;
        case 400:
          res.status(news.status).send(news.message);
          break;
        default:
          sendNewsOutcome(res, req, news);
          break;
      }
    } catch (e: unknown) {
      console.log("[ERROR] -> deleteNews", e);
      res.status(500).send("Unexpected Error");
    }
  }
  );

  return router;
}
