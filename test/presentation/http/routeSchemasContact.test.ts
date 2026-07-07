import test from "node:test";
import assert from "node:assert/strict";
import { submitPublicContactBodySchema } from "../../../presentation/http/schemas/routeSchemasContact.js";

test("submitPublicContactBodySchema: payload válido", () => {
  const parsed = submitPublicContactBodySchema.safeParse({
    name: "María López",
    email: "maria@example.com",
    phone: "+584149876543",
    subject: "Consulta",
    message: "Hola, tengo una pregunta.",
  });
  assert.equal(parsed.success, true);
});

test("submitPublicContactBodySchema: sin message falla", () => {
  const parsed = submitPublicContactBodySchema.safeParse({
    name: "María",
    email: "maria@example.com",
    subject: "Consulta",
    message: "",
  });
  assert.equal(parsed.success, false);
});

test("submitPublicContactBodySchema: email inválido falla", () => {
  const parsed = submitPublicContactBodySchema.safeParse({
    name: "María",
    email: "no-es-email",
    subject: "Consulta",
    message: "Hola",
  });
  assert.equal(parsed.success, false);
});
