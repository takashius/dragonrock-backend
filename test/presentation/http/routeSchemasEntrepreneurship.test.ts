import test from "node:test";
import assert from "node:assert/strict";
import {
  createEntrepreneurshipBodySchema,
  updateEntrepreneurshipBodySchema,
} from "../../../presentation/http/schemas/routeSchemasEntrepreneurship.js";

const validCreate = {
  entrepreneurName: "María López",
  businessName: "Rock & Threads",
  category: "Moda",
  status: "draft" as const,
  introduction: "<p>Historia</p>",
  questions: [{ question: "¿Cómo empezaste?", answer: "<p>Respuesta</p>" }],
};

test("createEntrepreneurshipBodySchema: payload válido", () => {
  const r = createEntrepreneurshipBodySchema.safeParse(validCreate);
  assert.equal(r.success, true);
});

test("createEntrepreneurshipBodySchema: questions vacío falla", () => {
  const r = createEntrepreneurshipBodySchema.safeParse({
    ...validCreate,
    questions: [],
  });
  assert.equal(r.success, false);
});

test("createEntrepreneurshipBodySchema: falta entrepreneurName falla", () => {
  const { entrepreneurName: _removed, ...rest } = validCreate;
  const r = createEntrepreneurshipBodySchema.safeParse(rest);
  assert.equal(r.success, false);
});

test("updateEntrepreneurshipBodySchema: id inválido falla", () => {
  const r = updateEntrepreneurshipBodySchema.safeParse({
    id: "not-an-object-id",
    status: "published",
  });
  assert.equal(r.success, false);
});

test("updateEntrepreneurshipBodySchema: questions con min 1 si se envían", () => {
  const r = updateEntrepreneurshipBodySchema.safeParse({
    id: "507f1f77bcf86cd799439011",
    questions: [],
  });
  assert.equal(r.success, false);
});
