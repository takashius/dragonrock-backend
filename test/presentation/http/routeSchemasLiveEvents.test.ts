import test from "node:test";
import assert from "node:assert/strict";
import {
  createLiveEventBodySchema,
  updateLiveEventBodySchema,
} from "../../../presentation/http/schemas/routeSchemasLiveEvents.js";

test("createLiveEventBodySchema: payload válido con coordenadas", () => {
  const parsed = createLiveEventBodySchema.safeParse({
    name: "Rock al Parque 2026",
    type: "concierto",
    status: "upcoming",
    date: "2026-07-01",
    time: "18:00",
    place: "Bogotá, Colombia",
    latitude: 4.711,
    longitude: -74.072,
    price: 25,
    isFeatured: true,
  });
  assert.equal(parsed.success, true);
});

test("createLiveEventBodySchema: falta name falla", () => {
  const parsed = createLiveEventBodySchema.safeParse({
    type: "concierto",
    status: "upcoming",
    date: "2026-07-01",
    time: "18:00",
    place: "Bogotá",
  });
  assert.equal(parsed.success, false);
});

test("createLiveEventBodySchema: date inválida falla", () => {
  const parsed = createLiveEventBodySchema.safeParse({
    name: "Evento",
    type: "concierto",
    status: "upcoming",
    date: "01-07-2026",
    time: "18:00",
    place: "Bogotá",
  });
  assert.equal(parsed.success, false);
});

test("createLiveEventBodySchema: price negativo falla", () => {
  const parsed = createLiveEventBodySchema.safeParse({
    name: "Evento",
    type: "concierto",
    status: "upcoming",
    date: "2026-07-01",
    time: "18:00",
    place: "Bogotá",
    price: -1,
  });
  assert.equal(parsed.success, false);
});

test("updateLiveEventBodySchema: id inválido falla", () => {
  const parsed = updateLiveEventBodySchema.safeParse({
    id: "not-an-object-id",
    name: "Nuevo nombre",
  });
  assert.equal(parsed.success, false);
});

test("updateLiveEventBodySchema: latitude fuera de rango falla", () => {
  const parsed = updateLiveEventBodySchema.safeParse({
    id: "507f1f77bcf86cd799439011",
    latitude: 100,
  });
  assert.equal(parsed.success, false);
});
