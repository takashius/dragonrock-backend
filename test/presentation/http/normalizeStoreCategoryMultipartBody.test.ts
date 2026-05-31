import test from "node:test";
import assert from "node:assert/strict";
import { normalizeStoreCategoryMultipartBody } from "../../../presentation/http/normalizeStoreCategoryMultipartBody.js";

test("normalizeStoreCategoryMultipartBody: elimina image placeholder string", () => {
  const body: Record<string, unknown> = {
    image: "string",
  };
  normalizeStoreCategoryMultipartBody(body);
  assert.equal("image" in body, false);
});

test("normalizeStoreCategoryMultipartBody: conserva data URI en image", () => {
  const body: Record<string, unknown> = {
    image: "data:image/png;base64,AAAA",
  };
  normalizeStoreCategoryMultipartBody(body);
  assert.equal(body.image, "data:image/png;base64,AAAA");
});

test("normalizeStoreCategoryMultipartBody: conserva URL Cloudinary en image", () => {
  const url =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/categories/a.jpg";
  const body: Record<string, unknown> = {
    image: url,
  };
  normalizeStoreCategoryMultipartBody(body);
  assert.equal(body.image, url);
});
