import type { Router } from "express";
import config from "../config.js";
import { MongooseStoreCategoryRepository } from "../infrastructure/persistence/mongooseStoreCategoryRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { PaginateStoreCategoriesUseCase } from "../application/storeCategories/paginateStoreCategoriesUseCase.js";
import { GetStoreCategoryDetailUseCase } from "../application/storeCategories/getStoreCategoryDetailUseCase.js";
import { ListSimpleStoreCategoriesUseCase } from "../application/storeCategories/listSimpleStoreCategoriesUseCase.js";
import { ListPublicStoreCategoriesUseCase } from "../application/storeCategories/listPublicStoreCategoriesUseCase.js";
import { CreateStoreCategoryUseCase } from "../application/storeCategories/createStoreCategoryUseCase.js";
import { UpdateStoreCategoryUseCase } from "../application/storeCategories/updateStoreCategoryUseCase.js";
import { DeleteStoreCategoryUseCase } from "../application/storeCategories/deleteStoreCategoryUseCase.js";
import { createStoreCategoriesRouter } from "../presentation/http/storeCategoriesRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

/**
 * Cableado HTTP del módulo Categorías de tienda.
 */
export function wireStoreCategoriesRouter(
  auth: AuthMiddlewareFactory
): Router {
  const repository = new MongooseStoreCategoryRepository();
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;
  return createStoreCategoriesRouter({
    auth,
    paginateStoreCategories: new PaginateStoreCategoriesUseCase(repository),
    getStoreCategoryDetail: new GetStoreCategoryDetailUseCase(repository),
    listSimpleStoreCategories: new ListSimpleStoreCategoriesUseCase(repository),
    listPublicStoreCategories: new ListPublicStoreCategoriesUseCase(repository),
    createStoreCategory: new CreateStoreCategoryUseCase(
      repository,
      mediaStorage
    ),
    updateStoreCategory: new UpdateStoreCategoryUseCase(
      repository,
      mediaStorage
    ),
    deleteStoreCategory: new DeleteStoreCategoryUseCase(
      repository,
      mediaStorage
    ),
  });
}
