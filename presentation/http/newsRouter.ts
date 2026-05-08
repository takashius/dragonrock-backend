import express, { type Router } from "express";
import type { ListNewsUseCase } from "../../application/news/listNewsUseCase.js";
import type { GetNewsDetailUseCase } from "../../application/news/getNewsDetailUseCase.js";
import type { PaginateNewsUseCase } from "../../application/news/paginateNewsUseCase.js";
import type { CreateNewsUseCase } from "../../application/news/createNewsUseCase.js";
import type { UpdateNewsUseCase } from "../../application/news/updateNewsUseCase.js";
import type { DeleteNewsUseCase } from "../../application/news/deleteNewsUseCase.js";
import auth from "../../middelware/auth.js";
import { sendNewsOutcome } from "./newsHttpMapper.js";

export type NewsRouterDeps = {
  listNews: ListNewsUseCase;
  getNewsDetail: GetNewsDetailUseCase;
  paginateNews: PaginateNewsUseCase;
  createNews: CreateNewsUseCase;
  updateNews: UpdateNewsUseCase;
  deleteNews: DeleteNewsUseCase;
};

export function createNewsRouter(deps: NewsRouterDeps): Router {
  const router = express.Router();

  router.get("/", auth(), async (req, res) => {
    try {
      const news = await deps.listNews.execute(String(req.user!.company));
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> getNews", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get("/paginate", auth(), async (req, res) => {
    try {
      const news = await deps.paginateNews.execute({
        filter: req.query.filter,
        page: req.query.page,
        companyId: String(req.user!.company),
      });
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> paginateNews", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.get("/:id", auth(), async (req, res) => {
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
  });

  router.post("/", auth(), async (req, res) => {
    try {
      const news = await deps.createNews.execute(
        req.body as Record<string, unknown>,
        String(req.user!._id),
        String(req.user!.company)
      );
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> addNews", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.patch("/", auth(), async (req, res) => {
    try {
      const news = await deps.updateNews.execute(
        req.body as { id: string } & Record<string, unknown>,
        String(req.user!.company)
      );
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> updateNews", e);
      res.status(500).send("Unexpected Error");
    }
  });

  router.delete("/:id", auth(), async (req, res) => {
    try {
      const news = await deps.deleteNews.execute(
        req.params.id,
        String(req.user!.company)
      );
      sendNewsOutcome(res, req, news);
    } catch (e: unknown) {
      console.log("[ERROR] -> deleteNews", e);
      res.status(500).send("Unexpected Error");
    }
  });

  return router;
}
