import type { Router } from "express";
import config from "../config.js";
import { MongooseEntrepreneurshipRepository } from "../infrastructure/persistence/mongooseEntrepreneurshipRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { PaginateEntrepreneurshipUseCase } from "../application/entrepreneurship/paginateEntrepreneurshipUseCase.js";
import { GetEntrepreneurshipDetailUseCase } from "../application/entrepreneurship/getEntrepreneurshipDetailUseCase.js";
import { ListPublishedEntrepreneurshipUseCase } from "../application/entrepreneurship/listPublishedEntrepreneurshipUseCase.js";
import { GetPublishedEntrepreneurshipDetailUseCase } from "../application/entrepreneurship/getPublishedEntrepreneurshipDetailUseCase.js";
import { CreateEntrepreneurshipUseCase } from "../application/entrepreneurship/createEntrepreneurshipUseCase.js";
import { UpdateEntrepreneurshipUseCase } from "../application/entrepreneurship/updateEntrepreneurshipUseCase.js";
import { DeleteEntrepreneurshipUseCase } from "../application/entrepreneurship/deleteEntrepreneurshipUseCase.js";
import { createEntrepreneurshipRouter } from "../presentation/http/entrepreneurshipRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

/**
 * Cableado HTTP del módulo Emprende (entrepreneurship). Reutiliza la misma fábrica `auth` que usuario/noticias.
 */
export function wireEntrepreneurshipRouter(
  auth: AuthMiddlewareFactory
): Router {
  const repository = new MongooseEntrepreneurshipRepository();
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;
  return createEntrepreneurshipRouter({
    auth,
    paginateEntrepreneurship: new PaginateEntrepreneurshipUseCase(repository),
    getEntrepreneurshipDetail: new GetEntrepreneurshipDetailUseCase(repository),
    listPublishedEntrepreneurship: new ListPublishedEntrepreneurshipUseCase(
      repository
    ),
    getPublishedEntrepreneurshipDetail:
      new GetPublishedEntrepreneurshipDetailUseCase(repository),
    createEntrepreneurship: new CreateEntrepreneurshipUseCase(
      repository,
      mediaStorage
    ),
    updateEntrepreneurship: new UpdateEntrepreneurshipUseCase(
      repository,
      mediaStorage
    ),
    deleteEntrepreneurship: new DeleteEntrepreneurshipUseCase(repository),
  });
}
