import type { Router } from "express";
import { MongooseDashboardRepository } from "../infrastructure/persistence/mongooseDashboardRepository.js";
import { GetDashboardUseCase } from "../application/dashboard/getDashboardUseCase.js";
import { createDashboardRouter } from "../presentation/http/dashboardRouter.js";
import type { AuthMiddlewareFactory } from "../presentation/http/authMiddlewareFactory.js";

export function wireDashboardRouter(auth: AuthMiddlewareFactory): Router {
  const repository = new MongooseDashboardRepository();
  return createDashboardRouter({
    auth,
    getDashboard: new GetDashboardUseCase(repository),
  });
}
