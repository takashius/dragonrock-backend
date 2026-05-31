import test from "node:test";
import assert from "node:assert/strict";
import {
  createServiceBodySchema,
  updateServiceBodySchema,
  paginateServicesQuerySchema,
} from "../../../presentation/http/schemas/routeSchemasServices.js";

test("createServiceBodySchema: payload válido", () => {
  const parsed = createServiceBodySchema.safeParse({
    name: "Desarrollo Web",
    slug: "desarrollo-web",
    category: "desarrolloWeb",
    status: "published",
    shortDescription: "Sitios y apps a medida",
    price: 150.5,
    showPriceFrom: true,
    contactUrl: "https://wa.me/123456789",
    tags: ["web", "react"],
    isFeatured: true,
  });
  assert.equal(parsed.success, true);
});

test("createServiceBodySchema: categoría inválida falla", () => {
  const parsed = createServiceBodySchema.safeParse({
    name: "Servicio",
    slug: "servicio",
    category: "invalida",
    status: "draft",
    shortDescription: "Resumen",
  });
  assert.equal(parsed.success, false);
});

test("createServiceBodySchema: slug inválido falla", () => {
  const parsed = createServiceBodySchema.safeParse({
    name: "Servicio",
    slug: "Slug Con Espacios",
    category: "otro",
    status: "draft",
    shortDescription: "Resumen",
  });
  assert.equal(parsed.success, false);
});

test("updateServiceBodySchema: id inválido falla", () => {
  const parsed = updateServiceBodySchema.safeParse({
    id: "bad-id",
    name: "Nuevo nombre",
  });
  assert.equal(parsed.success, false);
});

test("paginateServicesQuerySchema: acepta filtros opcionales", () => {
  const parsed = paginateServicesQuerySchema.safeParse({
    search: "web",
    category: "marketingDigital",
    status: "published",
    page: "1",
    pageSize: "20",
  });
  assert.equal(parsed.success, true);
});
