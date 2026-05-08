import type { Express } from "express";
import userRouter from "../components/user/network.js";
import { MongooseNewsRepository } from "../infrastructure/persistence/mongooseNewsRepository.js";
import { ListNewsUseCase } from "../application/news/listNewsUseCase.js";
import { GetNewsDetailUseCase } from "../application/news/getNewsDetailUseCase.js";
import { PaginateNewsUseCase } from "../application/news/paginateNewsUseCase.js";
import { CreateNewsUseCase } from "../application/news/createNewsUseCase.js";
import { UpdateNewsUseCase } from "../application/news/updateNewsUseCase.js";
import { DeleteNewsUseCase } from "../application/news/deleteNewsUseCase.js";
import { createNewsRouter } from "../presentation/http/newsRouter.js";

/** Prefijo global de la API (vacío = raíz). */
const API_PREFIX = "";

function buildNewsRouter() {
  const newsRepository = new MongooseNewsRepository();
  return createNewsRouter({
    listNews: new ListNewsUseCase(newsRepository),
    getNewsDetail: new GetNewsDetailUseCase(newsRepository),
    paginateNews: new PaginateNewsUseCase(newsRepository),
    createNews: new CreateNewsUseCase(newsRepository),
    updateNews: new UpdateNewsUseCase(newsRepository),
    deleteNews: new DeleteNewsUseCase(newsRepository),
  });
}

/**
 * Punto único donde se montan las rutas HTTP.
 * Noticias: casos de uso + repositorio Mongoose cableados aquí.
 */
export function registerRoutes(app: Express): void {
  app.use(`${API_PREFIX}/user`, userRouter);
  app.use(`${API_PREFIX}/news`, buildNewsRouter());
}
