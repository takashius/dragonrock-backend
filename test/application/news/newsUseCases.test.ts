import test from "node:test";
import assert from "node:assert/strict";
import type { NewsRepository } from "../../../application/ports/newsRepository.js";
import type { NewsOutcome } from "../../../application/types/newsOutcome.js";
import { ListNewsUseCase } from "../../../application/news/listNewsUseCase.js";
import { GetNewsDetailUseCase } from "../../../application/news/getNewsDetailUseCase.js";
import { CreateNewsUseCase } from "../../../application/news/createNewsUseCase.js";
import { UpdateNewsUseCase } from "../../../application/news/updateNewsUseCase.js";
import { DeleteNewsUseCase } from "../../../application/news/deleteNewsUseCase.js";
import { PaginateNewsUseCase } from "../../../application/news/paginateNewsUseCase.js";

const ok: NewsOutcome = { status: 200, message: [] };

function createRepo(overrides: Partial<NewsRepository> = {}): NewsRepository {
  return {
    listFirstForCompany: async () => ok,
    getDetail: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    paginate: async () => ok,
    ...overrides,
  } as NewsRepository;
}

test("ListNewsUseCase delega en el repositorio", async () => {
  let seen = "";
  const repo = createRepo({
    async listFirstForCompany(companyId: string) {
      seen = companyId;
      return ok;
    },
  });
  const uc = new ListNewsUseCase(repo);
  const r = await uc.execute("company-1");
  assert.equal(seen, "company-1");
  assert.equal(r.status, 200);
});

test("GetNewsDetailUseCase delega con id y empresa", async () => {
  let id = "";
  let company = "";
  const repo = createRepo({
    async getDetail(a: string, b: string) {
      id = a;
      company = b;
      return ok;
    },
  });
  const uc = new GetNewsDetailUseCase(repo);
  await uc.execute("nid", "cid");
  assert.equal(id, "nid");
  assert.equal(company, "cid");
});

test("CreateNewsUseCase delega", async () => {
  let uid = "";
  let cid = "";
  const repo = createRepo({
    async create(data, userId, companyId) {
      uid = userId;
      cid = companyId;
      return ok;
    },
  });
  const uc = new CreateNewsUseCase(repo);
  await uc.execute({ title: "t" }, "u1", "c1");
  assert.equal(uid, "u1");
  assert.equal(cid, "c1");
});

test("UpdateNewsUseCase delega", async () => {
  let cid = "";
  const repo = createRepo({
    async update(data, companyId) {
      cid = companyId;
      return ok;
    },
  });
  const uc = new UpdateNewsUseCase(repo);
  await uc.execute({ id: "1" } as { id: string }, "c2");
  assert.equal(cid, "c2");
});

test("DeleteNewsUseCase delega", async () => {
  let id = "";
  let cid = "";
  const repo = createRepo({
    async softDelete(a, b) {
      id = a;
      cid = b;
      return ok;
    },
  });
  const uc = new DeleteNewsUseCase(repo);
  await uc.execute("id1", "c3");
  assert.equal(id, "id1");
  assert.equal(cid, "c3");
});

test("PaginateNewsUseCase delega", async () => {
  let p: unknown;
  const repo = createRepo({
    async paginate(params) {
      p = params;
      return ok;
    },
  });
  const uc = new PaginateNewsUseCase(repo);
  await uc.execute({
    filter: "x",
    page: "2",
    companyId: "c4",
  });
  assert.deepEqual(p, {
    filter: "x",
    page: "2",
    companyId: "c4",
  });
});
