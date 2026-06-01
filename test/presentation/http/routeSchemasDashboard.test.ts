import test from "node:test";
import assert from "node:assert/strict";
import { dashboardQuerySchema } from "../../../presentation/http/schemas/routeSchemasDashboard.js";

test("dashboardQuerySchema: acepta límites opcionales", () => {
  const parsed = dashboardQuerySchema.safeParse({
    recentItemsLimit: "25",
    outOfStockLimit: "10",
  });
  assert.equal(parsed.success, true);
});

test("dashboardQuerySchema: rechaza límite no numérico", () => {
  const parsed = dashboardQuerySchema.safeParse({
    recentItemsLimit: "abc",
  });
  assert.equal(parsed.success, false);
});
