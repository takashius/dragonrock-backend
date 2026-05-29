import test from "node:test";
import assert from "node:assert/strict";
import {
  mergeEventDateTime,
  splitEventDateTime,
} from "../../../application/live-events/mergeEventDateTime.js";

test("mergeEventDateTime: combina date y time", () => {
  const dt = mergeEventDateTime("2026-06-15", "20:30");
  assert.ok(dt);
  assert.equal(dt!.getFullYear(), 2026);
  assert.equal(dt!.getMonth(), 5);
  assert.equal(dt!.getDate(), 15);
  assert.equal(dt!.getHours(), 20);
  assert.equal(dt!.getMinutes(), 30);
});

test("mergeEventDateTime: formato inválido retorna null", () => {
  assert.equal(mergeEventDateTime("15-06-2026", "20:30"), null);
  assert.equal(mergeEventDateTime("2026-06-15", "8:30"), null);
});

test("splitEventDateTime: descompone Date", () => {
  const dt = new Date(2026, 5, 15, 20, 30, 0, 0);
  assert.deepEqual(splitEventDateTime(dt), {
    date: "2026-06-15",
    time: "20:30",
  });
});

test("splitEventDateTime y mergeEventDateTime: roundtrip", () => {
  const dt = mergeEventDateTime("2026-12-01", "09:00");
  assert.ok(dt);
  assert.deepEqual(splitEventDateTime(dt!), {
    date: "2026-12-01",
    time: "09:00",
  });
});
