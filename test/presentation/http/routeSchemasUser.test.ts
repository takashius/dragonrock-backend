import test from "node:test";
import assert from "node:assert/strict";
import {
  addUserBodySchema,
  registerPublicBodySchema,
  updateUserBodySchema,
} from "../../../presentation/http/schemas/routeSchemas.js";

test("addUserBodySchema: acepta role válido y phone opcional", () => {
  const parsed = addUserBodySchema.safeParse({
    name: "Ana",
    lastname: "Diaz",
    email: "ana@example.com",
    password: "password123",
    role: "Editor",
    phone: "0414-555-1234",
  });
  assert.equal(parsed.success, true);
});

test("addUserBodySchema: rechaza role fuera del enum", () => {
  const parsed = addUserBodySchema.safeParse({
    name: "Ana",
    lastname: "Diaz",
    email: "ana@example.com",
    password: "password123",
    role: "Invitado",
  });
  assert.equal(parsed.success, false);
});

test("registerPublicBodySchema: permite phone opcional", () => {
  const parsed = registerPublicBodySchema.safeParse({
    name: "Mario",
    email: "mario@example.com",
    password: "password123",
    companyName: "Mi Empresa",
    docId: "J-12345678-9",
    phone: "0212-0000000",
  });
  assert.equal(parsed.success, true);
});

test("updateUserBodySchema: acepta cambio de role", () => {
  const parsed = updateUserBodySchema.safeParse({
    id: "507f1f77bcf86cd799439011",
    role: "Administrador",
  });
  assert.equal(parsed.success, true);
});
