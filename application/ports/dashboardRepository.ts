import type { DashboardOutcome } from "../types/dashboardOutcome.js";

export interface DashboardRepository {
  getSummary(
    companyId: string,
    options: { recentItemsLimit: number; outOfStockLimit: number }
  ): Promise<DashboardOutcome>;
}
