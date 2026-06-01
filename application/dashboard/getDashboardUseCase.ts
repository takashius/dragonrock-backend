import type { DashboardRepository } from "../ports/dashboardRepository.js";
import type { DashboardOutcome } from "../types/dashboardOutcome.js";

export class GetDashboardUseCase {
  constructor(private readonly dashboard: DashboardRepository) {}

  execute(
    companyId: string,
    options: { recentItemsLimit: number; outOfStockLimit: number }
  ): Promise<DashboardOutcome> {
    return this.dashboard.getSummary(companyId, options);
  }
}
