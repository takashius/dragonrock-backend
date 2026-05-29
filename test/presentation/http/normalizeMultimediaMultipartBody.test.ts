import test from "node:test";
import assert from "node:assert/strict";
import { normalizeMultimediaMultipartBody } from "../../../presentation/http/normalizeMultimediaMultipartBody.js";

test("normalizeMultimediaMultipartBody: coalesce galleryImages[] y conserva URLs Cloudinary", () => {
  const body: Record<string, unknown> = {
    "galleryImages[]":
      "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/a.jpg",
  };
  normalizeMultimediaMultipartBody(body);
  assert.equal("galleryImages[]" in body, false);
  assert.deepEqual(body.galleryImages, [
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/a.jpg",
  ]);
});

test("normalizeMultimediaMultipartBody: parsea existingGallery y coerce numéricos", () => {
  const body: Record<string, unknown> = {
    image: "string",
    season: "2",
    episode: "45",
    isFeatured: "true",
    existingGallery: JSON.stringify([
      "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
    ]),
    galleryImages: ["string", "data:image/png;base64,AAAA"],
  };
  normalizeMultimediaMultipartBody(body);
  assert.equal("image" in body, false);
  assert.equal(body.season, 2);
  assert.equal(body.episode, 45);
  assert.equal(body.isFeatured, true);
  assert.deepEqual(body.existingGallery, [
    "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
  ]);
  assert.deepEqual(body.galleryImages, ["data:image/png;base64,AAAA"]);
});

test("normalizeMultimediaMultipartBody: conserva URL Cloudinary en galleryImages", () => {
  const body: Record<string, unknown> = {
    galleryImages: [
      "string",
      "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/a.jpg",
    ],
  };
  normalizeMultimediaMultipartBody(body);
  assert.deepEqual(body.galleryImages, [
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/a.jpg",
  ]);
});
