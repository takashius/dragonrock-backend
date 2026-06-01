import test from "node:test";
import assert from "node:assert/strict";
import type { DashboardRepository } from "../../../application/ports/dashboardRepository.js";
import { GetDashboardUseCase } from "../../../application/dashboard/getDashboardUseCase.js";

test("GetDashboardUseCase delega con companyId y límites", async () => {
  let seenCompanyId = "";
  let seenLimits = { recentItemsLimit: 0, outOfStockLimit: 0 };
  const repo: DashboardRepository = {
    async getSummary(companyId, options) {
      seenCompanyId = companyId;
      seenLimits = options;
      return {
        status: 200,
        message: {
          recentlyOutOfStockProducts: [],
          recentItems: [],
          totals: {},
        },
      };
    },
  };

  await new GetDashboardUseCase(repo).execute("c1", {
    recentItemsLimit: 15,
    outOfStockLimit: 5,
  });

  assert.equal(seenCompanyId, "c1");
  assert.equal(seenLimits.recentItemsLimit, 15);
  assert.equal(seenLimits.outOfStockLimit, 5);
});
