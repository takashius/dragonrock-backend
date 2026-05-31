import type { Router } from "express";
import config from "../config.js";
import { MongooseServiceRepository } from "../infrastructure/persistence/mongooseServiceRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { PaginateServicesUseCase } from "../application/services/paginateServicesUseCase.js";
import { GetServiceDetailUseCase } from "../application/services/getServiceDetailUseCase.js";
import { ListPublishedServicesUseCase } from "../application/services/listPublishedServicesUseCase.js";
import { GetPublishedServiceDetailUseCase } from "../application/services/getPublishedServiceDetailUseCase.js";
import { CreateServiceUseCase } from "../application/services/createServiceUseCase.js";
import { UpdateServiceUseCase } from "../application/services/updateServiceUseCase.js";
import { DeleteServiceUseCase } from "../application/services/deleteServiceUseCase.js";
import { createServicesRouter } from "../presentation/http/servicesRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

/**
 * Cableado HTTP del módulo Servicios. Reutiliza la misma fábrica `auth` que usuario/noticias.
 */
export function wireServicesRouter(auth: AuthMiddlewareFactory): Router {
  const repository = new MongooseServiceRepository();
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;
  return createServicesRouter({
    auth,
    paginateServices: new PaginateServicesUseCase(repository),
    getServiceDetail: new GetServiceDetailUseCase(repository),
    listPublishedServices: new ListPublishedServicesUseCase(repository),
    getPublishedServiceDetail: new GetPublishedServiceDetailUseCase(repository),
    createService: new CreateServiceUseCase(repository, mediaStorage),
    updateService: new UpdateServiceUseCase(repository, mediaStorage),
    deleteService: new DeleteServiceUseCase(repository, mediaStorage),
  });
}
