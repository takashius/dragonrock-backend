import test from "node:test";
import assert from "node:assert/strict";
import type { StoreCategoryRepository } from "../../../application/ports/storeCategoryRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { CreateStoreCategoryUseCase } from "../../../application/storeCategories/createStoreCategoryUseCase.js";
import { UpdateStoreCategoryUseCase } from "../../../application/storeCategories/updateStoreCategoryUseCase.js";

const basePayload = {
  name: "Camisetas",
  slug: "camisetas",
  status: "activa" as const,
};

test("CreateStoreCategoryUseCase: sube imagen a Cloudinary", async () => {
  let stored: Record<string, unknown> | undefined;
  let uploadFolder = "";
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as StoreCategoryRepository;
  const media = {
    async upload(input: { folder: string }) {
      uploadFolder = input.folder;
      return {
        publicId: "cover",
        secureUrl:
          "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/categories/c.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new CreateStoreCategoryUseCase(repo, media).execute(
    {
      ...basePayload,
      image: "data:image/png;base64,AAAA",
    },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(
    stored?.featuredImage,
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/categories/c.jpg"
  );
  assert.equal(uploadFolder, "dragonrock/store/categories");
  assert.equal("image" in (stored ?? {}), false);
});

test("CreateStoreCategoryUseCase: ignora image placeholder string", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as StoreCategoryRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
  } as MediaStorage;

  await new CreateStoreCategoryUseCase(repo, media).execute(
    {
      ...basePayload,
      image: "string",
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.featuredImage, undefined);
});

test("UpdateStoreCategoryUseCase: reemplaza imagen y destruye la anterior", async () => {
  const oldCover =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/categories/old.jpg";
  const newCover =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/categories/new.jpg";
  let updatePayload: unknown;
  const destroyed: string[] = [];
  const repo = {
    async getDetail() {
      return {
        status: 200,
        message: { featuredImage: oldCover },
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
  } as unknown as StoreCategoryRepository;
  const media = {
    async upload() {
      return {
        publicId: "new",
        secureUrl: newCover,
        resourceType: "image",
      };
    },
    async destroyByUrl(url: string) {
      destroyed.push(url);
      return { publicId: url, result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateStoreCategoryUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      image: "data:image/png;base64,AAAA",
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal(
    (updatePayload as { featuredImage?: string }).featuredImage,
    newCover
  );
  assert.deepEqual(destroyed, [oldCover]);
});
