import test from "node:test";
import assert from "node:assert/strict";
import type { StoreProductRepository } from "../../../application/ports/storeProductRepository.js";
import type { StoreCategoryRepository } from "../../../application/ports/storeCategoryRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { CreateStoreProductUseCase } from "../../../application/storeProducts/createStoreProductUseCase.js";
import { UpdateStoreProductUseCase } from "../../../application/storeProducts/updateStoreProductUseCase.js";

const categoryOk = { status: 200, message: { _id: "cat1" } };

const basePayload = {
  name: "Camiseta DragonRock",
  slug: "camiseta-dragonrock",
  category: "507f1f77bcf86cd799439011",
  status: "activo" as const,
  price: 25,
  stock: 10,
};

test("CreateStoreProductUseCase: sube imagen principal y galería", async () => {
  let stored: Record<string, unknown> | undefined;
  const products = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as StoreProductRepository;
  const categories = {
    async getDetail() {
      return categoryOk;
    },
  } as unknown as StoreCategoryRepository;
  const media = {
    async upload(input: { folder: string }) {
      const isCover = input.folder.includes("cover");
      return {
        publicId: isCover ? "cover" : "gal",
        secureUrl: isCover
          ? "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/cover/c.jpg"
          : "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/gallery/g1.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new CreateStoreProductUseCase(
    products,
    categories,
    media
  ).execute(
    {
      ...basePayload,
      image: "data:image/png;base64,AAAA",
      galleryImages: ["data:image/png;base64,BBBB"],
    },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(
    stored?.featuredImage,
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/cover/c.jpg"
  );
  assert.deepEqual(stored?.galleryImages, [
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/gallery/g1.jpg",
  ]);
});

test("UpdateStoreProductUseCase: galleryImages con URLs elimina las no enviadas", async () => {
  const oldA =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/gallery/old-a.jpg";
  const keepB =
    "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/gallery/keep-b.jpg";
  let updatePayload: unknown;
  const destroyed: string[] = [];
  const products = {
    async getDetail() {
      return {
        status: 200,
        message: {
          status: "activo",
          stock: 5,
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
  } as unknown as StoreProductRepository;
  const categories = {
    async getDetail() {
      return categoryOk;
    },
  } as unknown as StoreCategoryRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
    async destroyByUrl(url: string) {
      destroyed.push(url);
      return { publicId: url, result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateStoreProductUseCase(
    products,
    categories,
    media
  ).execute(
    {
      id: "507f1f77bcf86cd799439011",
      galleryImages: [keepB],
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.deepEqual(
    (updatePayload as { galleryImages?: string[] }).galleryImages,
    [keepB]
  );
  assert.deepEqual(destroyed, [oldA]);
});

test("UpdateStoreProductUseCase: actualizar stock a 0 fuerza agotado", async () => {
  let updatePayload: unknown;
  const products = {
    async getDetail() {
      return {
        status: 200,
        message: { status: "activo", stock: 5, galleryImages: [] },
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
  } as unknown as StoreProductRepository;
  const categories = {
    async getDetail() {
      return categoryOk;
    },
  } as unknown as StoreCategoryRepository;

  const out = await new UpdateStoreProductUseCase(
    products,
    categories
  ).execute(
    {
      id: "507f1f77bcf86cd799439011",
      stock: 0,
      status: "activo",
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal((updatePayload as { status?: string }).status, "agotado");
});
