import test from "node:test";
import assert from "node:assert/strict";
import type { ServiceRepository } from "../../../application/ports/serviceRepository.js";
import type { ServiceOutcome } from "../../../application/types/serviceOutcome.js";
import { PaginateServicesUseCase } from "../../../application/services/paginateServicesUseCase.js";
import { CreateServiceUseCase } from "../../../application/services/createServiceUseCase.js";

const ok: ServiceOutcome = { status: 200, message: [] };

function createRepo(
  overrides: Partial<ServiceRepository> = {}
): ServiceRepository {
  return {
    listPublished: async () => ok,
    getPublishedDetail: async () => ok,
    getDetail: async () => ok,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as ServiceRepository;
}

const basePayload = {
  name: "Desarrollo Web",
  slug: "desarrollo-web",
  category: "desarrolloWeb" as const,
  status: "draft" as const,
  shortDescription: "Sitios y apps a medida",
};

test("PaginateServicesUseCase delega con companyId y category", async () => {
  let seenCategory = "";
  const repo = createRepo({
    async paginate(params) {
      seenCategory = String(params.category ?? "");
      return ok;
    },
  });
  await new PaginateServicesUseCase(repo).execute({
    search: "web",
    filter: undefined,
    category: "desarrolloWeb",
    status: "published",
    page: "1",
    companyId: "c1",
  });
  assert.equal(seenCategory, "desarrolloWeb");
});

test("CreateServiceUseCase: delega sin Cloudinary si no hay imagen", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = createRepo({
    async create(data) {
      stored = data;
      return ok;
    },
  });
  await new CreateServiceUseCase(repo).execute(
    {
      ...basePayload,
      price: 150,
      showPriceFrom: true,
      tags: ["web", "react"],
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.name, "Desarrollo Web");
  assert.equal(stored?.price, 150);
  assert.equal(stored?.showPriceFrom, true);
  assert.deepEqual(stored?.tags, ["web", "react"]);
  assert.equal("image" in (stored ?? {}), false);
});
