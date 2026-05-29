import type { Router } from "express";
import config from "../config.js";
import { MongooseMultimediaRepository } from "../infrastructure/persistence/mongooseMultimediaRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { PaginateMultimediaUseCase } from "../application/multimedia/paginateMultimediaUseCase.js";
import { GetMultimediaDetailUseCase } from "../application/multimedia/getMultimediaDetailUseCase.js";
import { ListPublishedMultimediaUseCase } from "../application/multimedia/listPublishedMultimediaUseCase.js";
import { GetPublishedMultimediaDetailUseCase } from "../application/multimedia/getPublishedMultimediaDetailUseCase.js";
import { CreateMultimediaUseCase } from "../application/multimedia/createMultimediaUseCase.js";
import { UpdateMultimediaUseCase } from "../application/multimedia/updateMultimediaUseCase.js";
import { DeleteMultimediaUseCase } from "../application/multimedia/deleteMultimediaUseCase.js";
import { createMultimediaRouter } from "../presentation/http/multimediaRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

/**
 * Cableado HTTP del módulo Multimedia. Reutiliza la misma fábrica `auth` que usuario/noticias.
 */
export function wireMultimediaRouter(auth: AuthMiddlewareFactory): Router {
  const repository = new MongooseMultimediaRepository();
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;
  return createMultimediaRouter({
    auth,
    paginateMultimedia: new PaginateMultimediaUseCase(repository),
    getMultimediaDetail: new GetMultimediaDetailUseCase(repository),
    listPublishedMultimedia: new ListPublishedMultimediaUseCase(repository),
    getPublishedMultimediaDetail: new GetPublishedMultimediaDetailUseCase(
      repository
    ),
    createMultimedia: new CreateMultimediaUseCase(repository, mediaStorage),
    updateMultimedia: new UpdateMultimediaUseCase(repository, mediaStorage),
    deleteMultimedia: new DeleteMultimediaUseCase(repository, mediaStorage),
  });
}
