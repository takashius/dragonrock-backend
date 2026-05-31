import test from "node:test";
import assert from "node:assert/strict";
import type { StoreProductRepository } from "../../../application/ports/storeProductRepository.js";
import type { StoreCategoryRepository } from "../../../application/ports/storeCategoryRepository.js";
import type { StoreProductOutcome } from "../../../application/types/storeProductOutcome.js";
import { CreateStoreProductUseCase } from "../../../application/storeProducts/createStoreProductUseCase.js";
import { PaginateStoreProductsUseCase } from "../../../application/storeProducts/paginateStoreProductsUseCase.js";

const ok: StoreProductOutcome = { status: 200, message: [] };
const categoryOk: StoreProductOutcome = { status: 200, message: { _id: "cat1" } };

function createProductRepo(
  overrides: Partial<StoreProductRepository> = {}
): StoreProductRepository {
  return {
    getDetail: async () => ok,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as StoreProductRepository;
}

function createCategoryRepo(
  overrides: Partial<StoreCategoryRepository> = {}
): StoreCategoryRepository {
  return {
    listSimple: async () => ok,
    getDetail: async () => categoryOk,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as StoreCategoryRepository;
}

const basePayload = {
  name: "Camiseta DragonRock",
  slug: "camiseta-dragonrock",
  category: "507f1f77bcf86cd799439011",
  status: "activo" as const,
  price: 25,
  stock: 10,
  image: "data:image/png;base64,AAAA",
};

test("PaginateStoreProductsUseCase delega con companyId y category", async () => {
  let seenCategory = "";
  const repo = createProductRepo({
    async paginate(params) {
      seenCategory = String(params.category ?? "");
      return ok;
    },
  });
  await new PaginateStoreProductsUseCase(repo).execute({
    search: "camiseta",
    filter: undefined,
    category: "507f1f77bcf86cd799439011",
    status: "activo",
    page: "1",
    companyId: "c1",
  });
  assert.equal(seenCategory, "507f1f77bcf86cd799439011");
});

test("CreateStoreProductUseCase: stock 0 fuerza status agotado", async () => {
  let stored: Record<string, unknown> | undefined;
  const products = createProductRepo({
    async create(data) {
      stored = data;
      return ok;
    },
  });
  const categories = createCategoryRepo();
  const media = {
    async upload() {
      return {
        publicId: "cover",
        secureUrl:
          "https://res.cloudinary.com/demo/image/upload/v1/dragonrock/store/products/cover/c.jpg",
        resourceType: "image",
      };
    },
  };

  await new CreateStoreProductUseCase(
    products,
    categories,
    media
  ).execute(
    { ...basePayload, stock: 0, status: "activo" },
    "u1",
    "c1"
  );

  assert.equal(stored?.status, "agotado");
  assert.equal(stored?.stock, 0);
});

test("CreateStoreProductUseCase: categoría inexistente retorna 400", async () => {
  const products = createProductRepo();
  const categories = createCategoryRepo({
    async getDetail() {
      return { status: 404, message: "Category not found" };
    },
  });
  const media = {
    async upload() {
      return {
        publicId: "cover",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/c.jpg",
        resourceType: "image",
      };
    },
  };

  const out = await new CreateStoreProductUseCase(
    products,
    categories,
    media
  ).execute(basePayload, "u1", "c1");

  assert.equal(out.status, 400);
  assert.equal(out.message, "Category not found");
});
