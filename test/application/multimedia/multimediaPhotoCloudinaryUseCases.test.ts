import test from "node:test";
import assert from "node:assert/strict";
import type { MultimediaRepository } from "../../../application/ports/multimediaRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { CreateMultimediaUseCase } from "../../../application/multimedia/createMultimediaUseCase.js";
import { UpdateMultimediaUseCase } from "../../../application/multimedia/updateMultimediaUseCase.js";

const baseGalleryPayload = {
  title: "Galería Rock",
  type: "gallery" as const,
  status: "draft" as const,
  date: "2026-05-27",
};

test("CreateMultimediaUseCase: gallery sube portada e imágenes", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as MultimediaRepository;
  let uploadFolder = "";
  const media = {
    async upload(input: { folder: string }) {
      uploadFolder = input.folder;
      const isCover = input.folder.includes("cover");
      return {
        publicId: isCover ? "cover" : "gal",
        secureUrl: isCover
          ? "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/cover/c.jpg"
          : "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/g1.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new CreateMultimediaUseCase(repo, media).execute(
    {
      ...baseGalleryPayload,
      image: "data:image/png;base64,AAAA",
      galleryImages: ["data:image/png;base64,BBBB"],
    },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(
    stored?.featuredImage,
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/cover/c.jpg"
  );
  assert.deepEqual(stored?.galleryImages, [
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/g1.jpg",
  ]);
  assert.equal(uploadFolder.includes("gallery"), true);
});

test("CreateMultimediaUseCase: ignora image placeholder string", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as MultimediaRepository;
  const media = {
    async upload() {
      return {
        publicId: "gal",
        secureUrl:
          "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/g1.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  await new CreateMultimediaUseCase(repo, media).execute(
    {
      ...baseGalleryPayload,
      image: "string",
      galleryImages: ["data:image/png;base64,BBBB"],
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.featuredImage, undefined);
});

test("UpdateMultimediaUseCase: galleryImages con URLs elimina las no enviadas", async () => {
  const oldA =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/old-a.jpg";
  const keepB =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/keep-b.jpg";
  let updatePayload: unknown;
  const destroyed: string[] = [];
  const repo = {
    async getDetail() {
      return {
        status: 200,
        message: {
          type: "gallery",
          galleryImages: [oldA, keepB],
        },
      };
    },
    async update(
      data: { id: string } & Record<string, unknown>,
      _companyId: string,
      _editorUserId: string
    ) {
      updatePayload = data;
      return { status: 200, message: "ok" };
    },
  } as unknown as MultimediaRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
    async destroyByUrl(url: string) {
      destroyed.push(url);
      return { publicId: url, result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateMultimediaUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      galleryImages: [keepB],
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.deepEqual((updatePayload as { galleryImages?: string[] }).galleryImages, [
    keepB,
  ]);
  assert.deepEqual(destroyed, [oldA]);
});

test("UpdateMultimediaUseCase: borra galería removida de Cloudinary", async () => {
  const oldA =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/old-a.jpg";
  const keepB =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/keep-b.jpg";
  let updatePayload: unknown;
  const destroyed: string[] = [];
  const repo = {
    async getDetail() {
      return {
        status: 200,
        message: {
          type: "gallery",
          galleryImages: [oldA, keepB],
        },
      };
    },
    async update(
      data: { id: string } & Record<string, unknown>,
      _companyId: string,
      _editorUserId: string
    ) {
      updatePayload = data;
      return { status: 200, message: "ok" };
    },
  } as unknown as MultimediaRepository;
  const media = {
    async upload() {
      return {
        publicId: "new",
        secureUrl:
          "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/new.jpg",
        resourceType: "image",
      };
    },
    async destroyByUrl(url: string) {
      destroyed.push(url);
      return { publicId: url, result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateMultimediaUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      galleryImages: [keepB, "data:image/png;base64,NNNN"],
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.deepEqual((updatePayload as { galleryImages?: string[] }).galleryImages, [
    keepB,
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/multimedia/gallery/new.jpg",
  ]);
  assert.deepEqual(destroyed, [oldA]);
});
