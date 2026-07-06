import type { Router } from "express";
import config from "../config.js";
import { MongooseStoreOrderRepository } from "../infrastructure/persistence/mongooseStoreOrderRepository.js";
import { MongooseStoreProductRepository } from "../infrastructure/persistence/mongooseStoreProductRepository.js";
import { MongooseCompanyLookup } from "../infrastructure/company/mongooseCompanyLookup.js";
import { MailjetMailSender } from "../infrastructure/email/mailjetMailSender.js";
import { CreatePublicStoreOrderUseCase } from "../application/storeOrders/createPublicStoreOrderUseCase.js";
import { PaginateStoreOrdersUseCase } from "../application/storeOrders/paginateStoreOrdersUseCase.js";
import { GetStoreOrderDetailUseCase } from "../application/storeOrders/getStoreOrderDetailUseCase.js";
import { createStoreOrdersRouter } from "../presentation/http/storeOrdersRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

export function wireStoreOrdersRouter(auth: AuthMiddlewareFactory): Router {
  const orderRepository = new MongooseStoreOrderRepository();
  const productRepository = new MongooseStoreProductRepository();
  const companyLookup = new MongooseCompanyLookup();
  const mailSender = new MailjetMailSender();
  const defaultCompanyId = config.companyDefault ?? "";

  return createStoreOrdersRouter({
    auth,
    createPublicStoreOrder: new CreatePublicStoreOrderUseCase(
      orderRepository,
      productRepository,
      companyLookup,
      mailSender,
      defaultCompanyId
    ),
    paginateStoreOrders: new PaginateStoreOrdersUseCase(orderRepository),
    getStoreOrderDetail: new GetStoreOrderDetailUseCase(orderRepository),
  });
}
