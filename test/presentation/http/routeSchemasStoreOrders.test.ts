import test from "node:test";
import assert from "node:assert/strict";
import {
  createPublicStoreOrderBodySchema,
  paginateStoreOrdersQuerySchema,
  updateStoreOrderBodySchema,
} from "../../../presentation/http/schemas/routeSchemasStoreOrders.js";

test("createPublicStoreOrderBodySchema: payload válido", () => {
  const parsed = createPublicStoreOrderBodySchema.safeParse({
    customer: {
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+584121234567",
      address: "Av. Principal 123, Caracas",
    },
    items: [{ productId: "507f1f77bcf86cd799439011", quantity: 2 }],
    notes: "Entregar por la tarde",
  });
  assert.equal(parsed.success, true);
});

test("createPublicStoreOrderBodySchema: sin items falla", () => {
  const parsed = createPublicStoreOrderBodySchema.safeParse({
    customer: {
      name: "Juan",
      email: "juan@example.com",
      phone: "0412",
      address: "Calle 1",
    },
    items: [],
  });
  assert.equal(parsed.success, false);
});

test("paginateStoreOrdersQuerySchema: acepta filtros opcionales", () => {
  const parsed = paginateStoreOrdersQuerySchema.safeParse({
    search: "ORD-2026",
    status: "pendiente",
    page: "1",
    pageSize: "20",
  });
  assert.equal(parsed.success, true);
});

test("updateStoreOrderBodySchema: id y status válidos", () => {
  const parsed = updateStoreOrderBodySchema.safeParse({
    id: "507f1f77bcf86cd799439011",
    status: "confirmado",
  });
  assert.equal(parsed.success, true);
});

test("updateStoreOrderBodySchema: status inválido falla", () => {
  const parsed = updateStoreOrderBodySchema.safeParse({
    id: "507f1f77bcf86cd799439011",
    status: "entregado",
  });
  assert.equal(parsed.success, false);
});
