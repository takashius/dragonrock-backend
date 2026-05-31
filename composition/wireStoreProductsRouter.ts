import type { Router } from "express";
import config from "../config.js";
import { MongooseStoreProductRepository } from "../infrastructure/persistence/mongooseStoreProductRepository.js";
import { MongooseStoreCategoryRepository } from "../infrastructure/persistence/mongooseStoreCategoryRepository.js";
import { CloudinaryMediaStorage } from "../infrastructure/media/cloudinaryMediaStorage.js";
import { PaginateStoreProductsUseCase } from "../application/storeProducts/paginateStoreProductsUseCase.js";
import { GetStoreProductDetailUseCase } from "../application/storeProducts/getStoreProductDetailUseCase.js";
import { CreateStoreProductUseCase } from "../application/storeProducts/createStoreProductUseCase.js";
import { UpdateStoreProductUseCase } from "../application/storeProducts/updateStoreProductUseCase.js";
import { DeleteStoreProductUseCase } from "../application/storeProducts/deleteStoreProductUseCase.js";
import { createStoreProductsRouter } from "../presentation/http/storeProductsRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

export function wireStoreProductsRouter(auth: AuthMiddlewareFactory): Router {
  const productRepository = new MongooseStoreProductRepository();
  const categoryRepository = new MongooseStoreCategoryRepository();
  const mediaStorage = config.cloudinaryEnabled
    ? new CloudinaryMediaStorage({
        cloudName: config.cloudinary.cloudName!,
        apiKey: config.cloudinary.apiKey!,
        apiSecret: config.cloudinary.apiSecret!,
        defaultFolder: config.cloudinary.folderName,
      })
    : undefined;
  return createStoreProductsRouter({
    auth,
    paginateStoreProducts: new PaginateStoreProductsUseCase(productRepository),
    getStoreProductDetail: new GetStoreProductDetailUseCase(productRepository),
    createStoreProduct: new CreateStoreProductUseCase(
      productRepository,
      categoryRepository,
      mediaStorage
    ),
    updateStoreProduct: new UpdateStoreProductUseCase(
      productRepository,
      categoryRepository,
      mediaStorage
    ),
    deleteStoreProduct: new DeleteStoreProductUseCase(
      productRepository,
      mediaStorage
    ),
  });
}
