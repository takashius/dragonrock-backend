import test from "node:test";
import assert from "node:assert/strict";
import { parseCommaSeparatedOrigins } from "../../config.js";

test("parseCommaSeparatedOrigins: vacío e indefinido", () => {
  assert.deepEqual(parseCommaSeparatedOrigins(undefined), []);
  assert.deepEqual(parseCommaSeparatedOrigins(""), []);
  assert.deepEqual(parseCommaSeparatedOrigins("   "), []);
});

test("parseCommaSeparatedOrigins: un origen", () => {
  assert.deepEqual(parseCommaSeparatedOrigins("https://a.com"), [
    "https://a.com",
  ]);
});

test("parseCommaSeparatedOrigins: varios y espacios", () => {
  assert.deepEqual(
    parseCommaSeparatedOrigins(" https://a.com , http://b.local "),
    ["https://a.com", "http://b.local"]
  );
});
