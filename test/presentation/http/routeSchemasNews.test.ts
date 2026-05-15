import test from "node:test";
import assert from "node:assert/strict";
import {
  createNewsBodySchema,
  updateNewsBodySchema,
} from "../../../presentation/http/schemas/routeSchemas.js";

test("createNewsBodySchema: acepta image en data URI", () => {
  const parsed = createNewsBodySchema.safeParse({
    title: "Titular",
    type: "other",
    status: "draft",
    image: "data:image/png;base64,AAAA",
  });
  assert.equal(parsed.success, true);
});

test("updateNewsBodySchema: acepta actualización de image", () => {
  const parsed = updateNewsBodySchema.safeParse({
    id: "507f1f77bcf86cd799439011",
    image: "data:image/png;base64,BBBB",
  });
  assert.equal(parsed.success, true);
});
