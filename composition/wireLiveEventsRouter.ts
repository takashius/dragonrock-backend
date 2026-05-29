import type { Router } from "express";
import config from "../config.js";
import { MongooseLiveEventRepository } from "../infrastructure/persistence/mongooseLiveEventRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { PaginateLiveEventsUseCase } from "../application/live-events/paginateLiveEventsUseCase.js";
import { GetLiveEventDetailUseCase } from "../application/live-events/getLiveEventDetailUseCase.js";
import { ListPublicLiveEventsUseCase } from "../application/live-events/listPublicLiveEventsUseCase.js";
import { GetPublicLiveEventDetailUseCase } from "../application/live-events/getPublicLiveEventDetailUseCase.js";
import { CreateLiveEventUseCase } from "../application/live-events/createLiveEventUseCase.js";
import { UpdateLiveEventUseCase } from "../application/live-events/updateLiveEventUseCase.js";
import { DeleteLiveEventUseCase } from "../application/live-events/deleteLiveEventUseCase.js";
import { createLiveEventsRouter } from "../presentation/http/liveEventsRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

/**
 * Cableado HTTP del módulo En vivo (live-events). Reutiliza la misma fábrica `auth` que usuario/noticias.
 */
export function wireLiveEventsRouter(auth: AuthMiddlewareFactory): Router {
  const repository = new MongooseLiveEventRepository();
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;
  return createLiveEventsRouter({
    auth,
    paginateLiveEvents: new PaginateLiveEventsUseCase(repository),
    getLiveEventDetail: new GetLiveEventDetailUseCase(repository),
    listPublicLiveEvents: new ListPublicLiveEventsUseCase(repository),
    getPublicLiveEventDetail: new GetPublicLiveEventDetailUseCase(repository),
    createLiveEvent: new CreateLiveEventUseCase(repository, mediaStorage),
    updateLiveEvent: new UpdateLiveEventUseCase(repository, mediaStorage),
    deleteLiveEvent: new DeleteLiveEventUseCase(repository),
  });
}
