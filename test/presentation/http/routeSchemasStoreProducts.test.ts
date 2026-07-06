import test from "node:test";
import assert from "node:assert/strict";
import {
  createStoreProductBodySchema,
  updateStoreProductBodySchema,
  paginateStoreProductsQuerySchema,
  listPublicStoreProductsQuerySchema,
  productSlugParamSchema,
} from "../../../presentation/http/schemas/routeSchemasStoreProducts.js";

test("createStoreProductBodySchema: payload válido", () => {
  const parsed = createStoreProductBodySchema.safeParse({
    name: "Camiseta DragonRock",
    slug: "camiseta-dragonrock",
    category: "507f1f77bcf86cd799439011",
    status: "activo",
    price: 25,
    compareAtPrice: 35,
    stock: 10,
    sku: "DR-CAM-001",
    image: "data:image/png;base64,AAAA",
    tags: ["ropa", "merch"],
    isFeatured: true,
  });
  assert.equal(parsed.success, true);
});

test("createStoreProductBodySchema: sin image falla", () => {
  const parsed = createStoreProductBodySchema.safeParse({
    name: "Camiseta",
    slug: "camiseta",
    category: "507f1f77bcf86cd799439011",
    status: "activo",
    price: 25,
    stock: 10,
  });
  assert.equal(parsed.success, false);
});

test("createStoreProductBodySchema: status inválido falla", () => {
  const parsed = createStoreProductBodySchema.safeParse({
    name: "Camiseta",
    slug: "camiseta",
    category: "507f1f77bcf86cd799439011",
    status: "published",
    price: 25,
    stock: 10,
    image: "data:image/png;base64,AAAA",
  });
  assert.equal(parsed.success, false);
});

test("updateStoreProductBodySchema: id inválido falla", () => {
  const parsed = updateStoreProductBodySchema.safeParse({
    id: "bad-id",
    name: "Nuevo nombre",
  });
  assert.equal(parsed.success, false);
});

test("paginateStoreProductsQuerySchema: acepta filtros opcionales", () => {
  const parsed = paginateStoreProductsQuerySchema.safeParse({
    search: "camiseta",
    category: "507f1f77bcf86cd799439011",
    status: "agotado",
    page: "1",
    pageSize: "20",
  });
  assert.equal(parsed.success, true);
});

test("listPublicStoreProductsQuerySchema: acepta category por slug e id", () => {
  const bySlug = listPublicStoreProductsQuerySchema.safeParse({
    category: "camisetas",
    search: "dragon",
    page: "1",
    pageSize: "20",
  });
  assert.equal(bySlug.success, true);

  const byId = listPublicStoreProductsQuerySchema.safeParse({
    category: "507f1f77bcf86cd799439011",
  });
  assert.equal(byId.success, true);
});

test("listPublicStoreProductsQuerySchema: pageSize inválido falla", () => {
  const parsed = listPublicStoreProductsQuerySchema.safeParse({
    pageSize: "abc",
  });
  assert.equal(parsed.success, false);
});

test("productSlugParamSchema: slug válido", () => {
  const parsed = productSlugParamSchema.safeParse({
    slug: "camiseta-dragonrock",
  });
  assert.equal(parsed.success, true);
});
