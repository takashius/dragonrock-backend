import test from "node:test";
import assert from "node:assert/strict";
import {
  createStoreCategoryBodySchema,
  updateStoreCategoryBodySchema,
  paginateStoreCategoriesQuerySchema,
} from "../../../presentation/http/schemas/routeSchemasStoreCategories.js";

test("createStoreCategoryBodySchema: payload válido", () => {
  const parsed = createStoreCategoryBodySchema.safeParse({
    name: "Camisetas",
    slug: "camisetas",
    status: "activa",
    description: "Ropa de banda",
  });
  assert.equal(parsed.success, true);
});

test("createStoreCategoryBodySchema: status inválido falla", () => {
  const parsed = createStoreCategoryBodySchema.safeParse({
    name: "Camisetas",
    slug: "camisetas",
    status: "published",
  });
  assert.equal(parsed.success, false);
});

test("createStoreCategoryBodySchema: slug inválido falla", () => {
  const parsed = createStoreCategoryBodySchema.safeParse({
    name: "Camisetas",
    slug: "Slug Con Espacios",
    status: "activa",
  });
  assert.equal(parsed.success, false);
});

test("updateStoreCategoryBodySchema: id inválido falla", () => {
  const parsed = updateStoreCategoryBodySchema.safeParse({
    id: "bad-id",
    name: "Nuevo nombre",
  });
  assert.equal(parsed.success, false);
});

test("paginateStoreCategoriesQuerySchema: acepta filtros opcionales", () => {
  const parsed = paginateStoreCategoriesQuerySchema.safeParse({
    search: "cam",
    status: "inactiva",
    page: "1",
    pageSize: "20",
  });
  assert.equal(parsed.success, true);
});
