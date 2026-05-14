import type { Router } from "express";
import { MongooseNewsRepository } from "../infrastructure/persistence/mongooseNewsRepository.js";
import { ListNewsUseCase } from "../application/news/listNewsUseCase.js";
import { GetNewsDetailUseCase } from "../application/news/getNewsDetailUseCase.js";
import { PaginateNewsUseCase } from "../application/news/paginateNewsUseCase.js";
import { CreateNewsUseCase } from "../application/news/createNewsUseCase.js";
import { UpdateNewsUseCase } from "../application/news/updateNewsUseCase.js";
import { DeleteNewsUseCase } from "../application/news/deleteNewsUseCase.js";
import { createNewsRouter } from "../presentation/http/newsRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

/**
 * Cableado HTTP del módulo de noticias. Reutiliza la misma fábrica `auth` que el stack de usuario.
 */
export function wireNewsRouter(auth: AuthMiddlewareFactory): Router {
  const newsRepository = new MongooseNewsRepository();
  return createNewsRouter({
    auth,
    listNews: new ListNewsUseCase(newsRepository),
    getNewsDetail: new GetNewsDetailUseCase(newsRepository),
    paginateNews: new PaginateNewsUseCase(newsRepository),
    createNews: new CreateNewsUseCase(newsRepository),
    updateNews: new UpdateNewsUseCase(newsRepository),
    deleteNews: new DeleteNewsUseCase(newsRepository),
  });
}
