import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveGalleryImagesForCreate,
  resolveGalleryImagesForUpdate,
} from "../../../application/multimedia/resolveGalleryImagesForSave.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";

const cloudUrlA =
  "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/a.jpg";
const cloudUrlB =
  "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/b.jpg";

test("resolveGalleryImagesForCreate: requiere al menos una imagen", async () => {
  const result = await resolveGalleryImagesForCreate([], undefined);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 400);
  }
});

test("resolveGalleryImagesForCreate: sube data URIs", async () => {
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/multimedia/gallery/x",
        secureUrl: cloudUrlA,
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const result = await resolveGalleryImagesForCreate(
    ["data:image/png;base64,AAAA"],
    media
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.galleryImages, [cloudUrlA]);
    assert.deepEqual(result.removedUrls, []);
  }
});

test("resolveGalleryImagesForUpdate: galleryInput con URLs es lista autoritativa", async () => {
  const media = {
    async upload() {
      throw new Error("no debería subir URL existente");
    },
  } as MediaStorage;

  const result = await resolveGalleryImagesForUpdate({
    previousGallery: [cloudUrlA, cloudUrlB],
    galleryInput: [cloudUrlB],
    mediaStorage: media,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.galleryImages, [cloudUrlB]);
    assert.deepEqual(result.removedUrls, [cloudUrlA]);
  }
});

test("resolveGalleryImagesForUpdate: conserva existingGallery y sube nuevas", async () => {
  let uploadCount = 0;
  const media = {
    async upload() {
      uploadCount += 1;
      return {
        publicId: "dragonrock/multimedia/gallery/new",
        secureUrl:
          "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/new.jpg",
        resourceType: "image",
      };
    },
    async destroyByUrl(url: string) {
      return { publicId: url, result: "ok" };
    },
  } as MediaStorage;

  const result = await resolveGalleryImagesForUpdate({
    previousGallery: [cloudUrlA, cloudUrlB],
    existingGallery: [cloudUrlB],
    newGalleryInput: ["data:image/png;base64,BBBB"],
    mediaStorage: media,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.galleryImages.length, 2);
    assert.equal(result.galleryImages[0], cloudUrlB);
    assert.equal(uploadCount, 1);
    assert.deepEqual(result.removedUrls, [cloudUrlA]);
  }
});
