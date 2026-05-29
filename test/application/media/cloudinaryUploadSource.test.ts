import test from "node:test";
import assert from "node:assert/strict";
import {
  isExistingCloudinaryUrl,
  resolveFeaturedImageForUpload,
  shouldUploadToCloudinary,
} from "../../../application/media/cloudinaryUploadSource.js";

test("shouldUploadToCloudinary: data URI y http(s) sí", () => {
  assert.equal(shouldUploadToCloudinary("data:image/png;base64,AAAA"), true);
  assert.equal(shouldUploadToCloudinary("https://example.com/a.jpg"), true);
});

test("shouldUploadToCloudinary: placeholder string no", () => {
  assert.equal(shouldUploadToCloudinary("string"), false);
  assert.equal(shouldUploadToCloudinary(""), false);
});

test("resolveFeaturedImageForUpload: ignora placeholder", () => {
  const r = resolveFeaturedImageForUpload("string");
  assert.equal(r.upload, false);
  assert.equal("value" in r ? r.value : undefined, undefined);
});

test("resolveFeaturedImageForUpload: conserva URL Cloudinary sin re-subir", () => {
  const url =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/e1.jpg";
  const r = resolveFeaturedImageForUpload(url);
  assert.equal(r.upload, false);
  assert.equal(r.value, url);
});

test("isExistingCloudinaryUrl: detecta host Cloudinary", () => {
  assert.equal(
    isExistingCloudinaryUrl(
      "https://res.cloudinary.com/demo/image/upload/v1/x.jpg"
    ),
    true
  );
  assert.equal(isExistingCloudinaryUrl("https://example.com/x.jpg"), false);
});
