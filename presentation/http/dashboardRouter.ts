import express, { type Router } from "express";
import type { GetDashboardUseCase } from "../../application/dashboard/getDashboardUseCase.js";
import { sendDashboardOutcome } from "./dashboardHttpMapper.js";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import { validateQuery } from "./validateRequest.js";
import {
  dashboardQuerySchema,
  DEFAULT_OUT_OF_STOCK_LIMIT,
  DEFAULT_RECENT_ITEMS_LIMIT,
  MAX_OUT_OF_STOCK_LIMIT,
  MAX_RECENT_ITEMS_LIMIT,
  type DashboardQuery,
} from "./schemas/routeSchemasDashboard.js";

export type DashboardRouterDeps = {
  auth: AuthMiddlewareFactory;
  getDashboard: GetDashboardUseCase;
};

export function createDashboardRouter(deps: DashboardRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get(
    "/",
    auth(),
    validateQuery(dashboardQuerySchema),
    async (req, res) => {
      try {
        const q = req.validatedQuery as DashboardQuery;
        const recentItemsLimit = Math.min(
          Math.max(
            1,
            parseInt(q.recentItemsLimit ?? String(DEFAULT_RECENT_ITEMS_LIMIT), 10) ||
              DEFAULT_RECENT_ITEMS_LIMIT
          ),
          MAX_RECENT_ITEMS_LIMIT
        );
        const outOfStockLimit = Math.min(
          Math.max(
            1,
            parseInt(q.outOfStockLimit ?? String(DEFAULT_OUT_OF_STOCK_LIMIT), 10) ||
              DEFAULT_OUT_OF_STOCK_LIMIT
          ),
          MAX_OUT_OF_STOCK_LIMIT
        );

        const outcome = await deps.getDashboard.execute(
          String(req.user!.company),
          { recentItemsLimit, outOfStockLimit }
        );
        sendDashboardOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> getDashboard", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
