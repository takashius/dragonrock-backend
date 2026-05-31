import test from "node:test";
import assert from "node:assert/strict";
import type { StoreCategoryRepository } from "../../../application/ports/storeCategoryRepository.js";
import type { StoreCategoryOutcome } from "../../../application/types/storeCategoryOutcome.js";
import { PaginateStoreCategoriesUseCase } from "../../../application/storeCategories/paginateStoreCategoriesUseCase.js";
import { ListSimpleStoreCategoriesUseCase } from "../../../application/storeCategories/listSimpleStoreCategoriesUseCase.js";
import { CreateStoreCategoryUseCase } from "../../../application/storeCategories/createStoreCategoryUseCase.js";

const ok: StoreCategoryOutcome = { status: 200, message: [] };

function createRepo(
  overrides: Partial<StoreCategoryRepository> = {}
): StoreCategoryRepository {
  return {
    listSimple: async () => ok,
    getDetail: async () => ok,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as StoreCategoryRepository;
}

const basePayload = {
  name: "Camisetas",
  slug: "camisetas",
  status: "activa" as const,
};

test("ListSimpleStoreCategoriesUseCase delega con companyId", async () => {
  let seenCompanyId = "";
  const repo = createRepo({
    async listSimple(companyId) {
      seenCompanyId = companyId;
      return ok;
    },
  });
  await new ListSimpleStoreCategoriesUseCase(repo).execute("c1");
  assert.equal(seenCompanyId, "c1");
});

test("PaginateStoreCategoriesUseCase delega con companyId y status", async () => {
  let seenStatus = "";
  const repo = createRepo({
    async paginate(params) {
      seenStatus = String(params.status ?? "");
      return ok;
    },
  });
  await new PaginateStoreCategoriesUseCase(repo).execute({
    search: "cam",
    filter: undefined,
    status: "activa",
    page: "1",
    companyId: "c1",
  });
  assert.equal(seenStatus, "activa");
});

test("CreateStoreCategoryUseCase: delega sin Cloudinary si no hay imagen", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = createRepo({
    async create(data) {
      stored = data;
      return ok;
    },
  });
  await new CreateStoreCategoryUseCase(repo).execute(
    {
      ...basePayload,
      description: "Ropa de banda",
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.name, "Camisetas");
  assert.equal(stored?.description, "Ropa de banda");
  assert.equal("image" in (stored ?? {}), false);
});
