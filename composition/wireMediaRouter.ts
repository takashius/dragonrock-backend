import type { Router } from "express";
import config from "../config.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { UploadMediaUseCase } from "../application/media/uploadMediaUseCase.js";
import { DeleteMediaUseCase } from "../application/media/deleteMediaUseCase.js";
import { createMediaRouter } from "../presentation/http/mediaRouter.js";

export function wireMediaRouter(auth: AuthMiddlewareFactory): Router {
  if (!config.cloudinaryEnabled) {
    return createMediaRouter({
      auth,
      enabled: false,
    });
  }

  const cloudinaryStorage = new CloudinaryMediaStorage({
    cloudName: config.cloudinary.cloudName!,
    apiKey: config.cloudinary.apiKey!,
    apiSecret: config.cloudinary.apiSecret!,
    defaultFolder: config.cloudinary.folderName,
  });

  return createMediaRouter({
    auth,
    enabled: true,
    uploadMedia: new UploadMediaUseCase(cloudinaryStorage),
    deleteMedia: new DeleteMediaUseCase(cloudinaryStorage),
  });
}
