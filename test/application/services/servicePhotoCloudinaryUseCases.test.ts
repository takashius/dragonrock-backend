import test from "node:test";
import assert from "node:assert/strict";
import type { ServiceRepository } from "../../../application/ports/serviceRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { CreateServiceUseCase } from "../../../application/services/createServiceUseCase.js";
import { UpdateServiceUseCase } from "../../../application/services/updateServiceUseCase.js";

const basePayload = {
  name: "Desarrollo Web",
  slug: "desarrollo-web",
  category: "desarrolloWeb" as const,
  status: "draft" as const,
  shortDescription: "Sitios y apps a medida",
};

test("CreateServiceUseCase: sube portada a Cloudinary", async () => {
  let stored: Record<string, unknown> | undefined;
  let uploadFolder = "";
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as ServiceRepository;
  const media = {
    async upload(input: { folder: string }) {
      uploadFolder = input.folder;
      return {
        publicId: "cover",
        secureUrl:
          "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/services/cover/c.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new CreateServiceUseCase(repo, media).execute(
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
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/services/cover/c.jpg"
  );
  assert.equal(uploadFolder, "dragonrock/services/cover");
  assert.equal("image" in (stored ?? {}), false);
});

test("CreateServiceUseCase: ignora image placeholder string", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as ServiceRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
  } as MediaStorage;

  await new CreateServiceUseCase(repo, media).execute(
    {
      ...basePayload,
      image: "string",
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.featuredImage, undefined);
});

test("UpdateServiceUseCase: reemplaza portada y destruye la anterior", async () => {
  const oldCover =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/services/cover/old.jpg";
  const newCover =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/services/cover/new.jpg";
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
  } as unknown as ServiceRepository;
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

  const out = await new UpdateServiceUseCase(repo, media).execute(
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

test("UpdateServiceUseCase: clearPrice elimina precio", async () => {
  let updatePayload: unknown;
  const repo = {
    async getDetail() {
      return {
        status: 200,
        message: { featuredImage: undefined, price: 150 },
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
  } as unknown as ServiceRepository;

  const out = await new UpdateServiceUseCase(repo).execute(
    {
      id: "507f1f77bcf86cd799439011",
      clearPrice: true,
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal((updatePayload as { price?: number }).price, undefined);
  assert.equal("clearPrice" in (updatePayload as object), false);
});
