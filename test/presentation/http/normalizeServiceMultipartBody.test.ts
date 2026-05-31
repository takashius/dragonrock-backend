import test from "node:test";
import assert from "node:assert/strict";
import { normalizeServiceMultipartBody } from "../../../presentation/http/normalizeServiceMultipartBody.js";

test("normalizeServiceMultipartBody: coerce booleanos y precio", () => {
  const body: Record<string, unknown> = {
    isFeatured: "true",
    showPriceFrom: "1",
    price: "199.99",
  };
  normalizeServiceMultipartBody(body);
  assert.equal(body.isFeatured, true);
  assert.equal(body.showPriceFrom, true);
  assert.equal(body.price, 199.99);
});

test("normalizeServiceMultipartBody: precio vacío activa clearPrice", () => {
  const body: Record<string, unknown> = {
    price: "",
  };
  normalizeServiceMultipartBody(body);
  assert.equal("price" in body, false);
  assert.equal(body.clearPrice, true);
});

test("normalizeServiceMultipartBody: parsea tags separados por coma", () => {
  const body: Record<string, unknown> = {
    tags: "web, marketing , diseño",
  };
  normalizeServiceMultipartBody(body);
  assert.deepEqual(body.tags, ["web", "marketing", "diseño"]);
});

test("normalizeServiceMultipartBody: elimina image placeholder string", () => {
  const body: Record<string, unknown> = {
    image: "string",
  };
  normalizeServiceMultipartBody(body);
  assert.equal("image" in body, false);
});

test("normalizeServiceMultipartBody: conserva data URI en image", () => {
  const body: Record<string, unknown> = {
    image: "data:image/png;base64,AAAA",
  };
  normalizeServiceMultipartBody(body);
  assert.equal(body.image, "data:image/png;base64,AAAA");
});

test("normalizeServiceMultipartBody: conserva URL Cloudinary en image", () => {
  const url =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/services/cover/a.jpg";
  const body: Record<string, unknown> = {
    image: url,
  };
  normalizeServiceMultipartBody(body);
  assert.equal(body.image, url);
});
