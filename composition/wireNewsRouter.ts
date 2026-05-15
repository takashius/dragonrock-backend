import type { Router } from "express";
import config from "../config.js";
import { MongooseNewsRepository } from "../infrastructure/persistence/mongooseNewsRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
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
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;
  return createNewsRouter({
    auth,
    listNews: new ListNewsUseCase(newsRepository),
    getNewsDetail: new GetNewsDetailUseCase(newsRepository),
    paginateNews: new PaginateNewsUseCase(newsRepository),
    createNews: new CreateNewsUseCase(newsRepository, mediaStorage),
    updateNews: new UpdateNewsUseCase(newsRepository, mediaStorage),
    deleteNews: new DeleteNewsUseCase(newsRepository),
  });
}
