import test from "node:test";
import assert from "node:assert/strict";
import {
  formatContentDate,
  parseContentDate,
} from "../../../application/multimedia/parseContentDate.js";

test("parseContentDate: parsea YYYY-MM-DD", () => {
  const d = parseContentDate("2026-05-27");
  assert.ok(d);
  assert.equal(d!.getFullYear(), 2026);
  assert.equal(d!.getMonth(), 4);
  assert.equal(d!.getDate(), 27);
});

test("parseContentDate: formato inválido retorna null", () => {
  assert.equal(parseContentDate("27-05-2026"), null);
});

test("formatContentDate: formatea Date", () => {
  const d = new Date(2026, 4, 27);
  assert.equal(formatContentDate(d), "2026-05-27");
});
