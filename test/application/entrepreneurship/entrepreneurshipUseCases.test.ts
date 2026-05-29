import test from "node:test";
import assert from "node:assert/strict";
import type { EntrepreneurshipRepository } from "../../../application/ports/entrepreneurshipRepository.js";
import type { EntrepreneurshipOutcome } from "../../../application/types/entrepreneurshipOutcome.js";
import { PaginateEntrepreneurshipUseCase } from "../../../application/entrepreneurship/paginateEntrepreneurshipUseCase.js";
import { GetEntrepreneurshipDetailUseCase } from "../../../application/entrepreneurship/getEntrepreneurshipDetailUseCase.js";
import { CreateEntrepreneurshipUseCase } from "../../../application/entrepreneurship/createEntrepreneurshipUseCase.js";
import { ListPublishedEntrepreneurshipUseCase } from "../../../application/entrepreneurship/listPublishedEntrepreneurshipUseCase.js";

const ok: EntrepreneurshipOutcome = { status: 200, message: [] };

function createRepo(
  overrides: Partial<EntrepreneurshipRepository> = {}
): EntrepreneurshipRepository {
  return {
    listPublished: async () => ok,
    getPublishedDetail: async () => ok,
    getDetail: async () => ok,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as EntrepreneurshipRepository;
}

test("PaginateEntrepreneurshipUseCase delega con companyId y search", async () => {
  let seenSearch = "";
  let seenCompany = "";
  const repo = createRepo({
    async paginate(params) {
      seenSearch = params.search ?? "";
      seenCompany = params.companyId;
      return ok;
    },
  });
  const uc = new PaginateEntrepreneurshipUseCase(repo);
  await uc.execute({
    search: "María",
    filter: undefined,
    page: "1",
    companyId: "company-1",
  });
  assert.equal(seenSearch, "María");
  assert.equal(seenCompany, "company-1");
});

test("GetEntrepreneurshipDetailUseCase delega con id y empresa", async () => {
  let id = "";
  let company = "";
  const repo = createRepo({
    async getDetail(a, b) {
      id = a;
      company = b;
      return ok;
    },
  });
  const uc = new GetEntrepreneurshipDetailUseCase(repo);
  await uc.execute("eid", "cid");
  assert.equal(id, "eid");
  assert.equal(company, "cid");
});

test("ListPublishedEntrepreneurshipUseCase delega", async () => {
  let called = false;
  const repo = createRepo({
    async listPublished() {
      called = true;
      return ok;
    },
  });
  const uc = new ListPublishedEntrepreneurshipUseCase(repo);
  await uc.execute();
  assert.equal(called, true);
});

test("CreateEntrepreneurshipUseCase delega create sin imagen", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = createRepo({
    async create(data) {
      stored = data;
      return ok;
    },
  });
  const uc = new CreateEntrepreneurshipUseCase(repo);
  await uc.execute(
    {
      entrepreneurName: "María",
      businessName: "Rock & Threads",
      category: "Moda",
      status: "draft",
      introduction: "<p>Hola</p>",
      questions: [{ question: "Q?", answer: "<p>A</p>" }],
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.entrepreneurName, "María");
});
