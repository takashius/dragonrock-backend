import test from "node:test";
import assert from "node:assert/strict";
import { resolveProductStatusFromStock } from "../../../application/storeProducts/storeProductPayloadHelpers.js";

test("resolveProductStatusFromStock: stock 0 fuerza agotado", () => {
  assert.equal(resolveProductStatusFromStock(0, "activo"), "agotado");
  assert.equal(resolveProductStatusFromStock(0, "inactivo"), "agotado");
});

test("resolveProductStatusFromStock: stock > 0 conserva estado", () => {
  assert.equal(resolveProductStatusFromStock(5, "activo"), "activo");
  assert.equal(resolveProductStatusFromStock(1, "inactivo"), "inactivo");
});
