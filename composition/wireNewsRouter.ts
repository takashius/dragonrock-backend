import express, { type Router } from "express";
import config from "../config.js";
import { MongooseNewsRepository } from "../infrastructure/persistence/mongooseNewsRepository.js";
import { MongooseNewsCommentRepository } from "../infrastructure/persistence/mongooseNewsCommentRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { GoogleRecaptchaVerifier } from "../infrastructure/captcha/googleRecaptchaVerifier.js";
import { ListNewsUseCase } from "../application/news/listNewsUseCase.js";
import { GetNewsDetailUseCase } from "../application/news/getNewsDetailUseCase.js";
import { ListPublishedNewsUseCase } from "../application/news/listPublishedNewsUseCase.js";
import { GetPublishedNewsDetailUseCase } from "../application/news/getPublishedNewsDetailUseCase.js";
import { PaginateNewsUseCase } from "../application/news/paginateNewsUseCase.js";
import { CreateNewsUseCase } from "../application/news/createNewsUseCase.js";
import { UpdateNewsUseCase } from "../application/news/updateNewsUseCase.js";
import { DeleteNewsUseCase } from "../application/news/deleteNewsUseCase.js";
import { ListPublishedNewsCommentsUseCase } from "../application/newsComments/listPublishedNewsCommentsUseCase.js";
import { CreatePublicNewsCommentUseCase } from "../application/newsComments/createPublicNewsCommentUseCase.js";
import { DeleteNewsCommentUseCase } from "../application/newsComments/deleteNewsCommentUseCase.js";
import { createNewsRouter } from "../presentation/http/newsRouter.js";
import { createNewsCommentsRouter } from "../presentation/http/newsCommentsRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

/**
 * Cableado HTTP del módulo de noticias. Reutiliza la misma fábrica `auth` que el stack de usuario.
 */
export function wireNewsRouter(auth: AuthMiddlewareFactory): Router {
  const newsRepository = new MongooseNewsRepository();
  const commentsRepository = new MongooseNewsCommentRepository();
  const captchaVerifier = config.recaptchaSecretKey
    ? new GoogleRecaptchaVerifier(
        config.recaptchaSecretKey,
        config.recaptchaMinScore
      )
    : undefined;
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;

  const router = express.Router();
  router.use(
    createNewsCommentsRouter({
      auth,
      listPublishedNewsComments: new ListPublishedNewsCommentsUseCase(
        newsRepository,
        commentsRepository
      ),
      createPublicNewsComment: new CreatePublicNewsCommentUseCase(
        newsRepository,
        commentsRepository,
        captchaVerifier,
        config.recaptchaEnabled
      ),
      deleteNewsComment: new DeleteNewsCommentUseCase(commentsRepository),
    })
  );
  router.use(
    createNewsRouter({
      auth,
      listNews: new ListNewsUseCase(newsRepository),
      getNewsDetail: new GetNewsDetailUseCase(newsRepository),
      listPublishedNews: new ListPublishedNewsUseCase(newsRepository),
      getPublishedNewsDetail: new GetPublishedNewsDetailUseCase(
        newsRepository
      ),
      paginateNews: new PaginateNewsUseCase(newsRepository),
      createNews: new CreateNewsUseCase(newsRepository, mediaStorage),
      updateNews: new UpdateNewsUseCase(newsRepository, mediaStorage),
      deleteNews: new DeleteNewsUseCase(newsRepository),
    })
  );
  return router;
}
