import test from "node:test";
import assert from "node:assert/strict";
import { normalizeStoreProductMultipartBody } from "../../../presentation/http/normalizeStoreProductMultipartBody.js";

test("normalizeStoreProductMultipartBody: coerce numéricos y tags", () => {
  const body: Record<string, unknown> = {
    price: "25.99",
    compareAtPrice: "35",
    stock: "10",
    isFeatured: "true",
    tags: "ropa, merch",
  };
  normalizeStoreProductMultipartBody(body);
  assert.equal(body.price, 25.99);
  assert.equal(body.compareAtPrice, 35);
  assert.equal(body.stock, 10);
  assert.equal(body.isFeatured, true);
  assert.deepEqual(body.tags, ["ropa", "merch"]);
});

test("normalizeStoreProductMultipartBody: coalesce galleryImages[]", () => {
  const body: Record<string, unknown> = {
    "galleryImages[]":
      "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/gallery/a.jpg",
  };
  normalizeStoreProductMultipartBody(body);
  assert.equal("galleryImages[]" in body, false);
  assert.deepEqual(body.galleryImages, [
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/gallery/a.jpg",
  ]);
});

test("normalizeStoreProductMultipartBody: elimina image placeholder string", () => {
  const body: Record<string, unknown> = {
    image: "string",
  };
  normalizeStoreProductMultipartBody(body);
  assert.equal("image" in body, false);
});
