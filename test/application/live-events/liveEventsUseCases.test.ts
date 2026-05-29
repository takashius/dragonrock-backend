import test from "node:test";
import assert from "node:assert/strict";
import type { LiveEventRepository } from "../../../application/ports/liveEventRepository.js";
import type { LiveEventOutcome } from "../../../application/types/liveEventOutcome.js";
import { PaginateLiveEventsUseCase } from "../../../application/live-events/paginateLiveEventsUseCase.js";
import { GetLiveEventDetailUseCase } from "../../../application/live-events/getLiveEventDetailUseCase.js";
import { ListPublicLiveEventsUseCase } from "../../../application/live-events/listPublicLiveEventsUseCase.js";

const ok: LiveEventOutcome = { status: 200, message: [] };

function createRepo(
  overrides: Partial<LiveEventRepository> = {}
): LiveEventRepository {
  return {
    listPublic: async () => ok,
    getPublicDetail: async () => ok,
    getDetail: async () => ok,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as LiveEventRepository;
}

test("PaginateLiveEventsUseCase delega con companyId, type y status", async () => {
  let seenCompany = "";
  let seenType = "";
  let seenStatus = "";
  const repo = createRepo({
    async paginate(params) {
      seenCompany = params.companyId;
      seenType = String(params.type ?? "");
      seenStatus = String(params.status ?? "");
      return ok;
    },
  });
  const uc = new PaginateLiveEventsUseCase(repo);
  await uc.execute({
    search: "Rock",
    filter: undefined,
    type: "concierto",
    status: "upcoming",
    page: "1",
    companyId: "company-1",
  });
  assert.equal(seenCompany, "company-1");
  assert.equal(seenType, "concierto");
  assert.equal(seenStatus, "upcoming");
});

test("GetLiveEventDetailUseCase delega con id y empresa", async () => {
  let id = "";
  let company = "";
  const repo = createRepo({
    async getDetail(a, b) {
      id = a;
      company = b;
      return ok;
    },
  });
  const uc = new GetLiveEventDetailUseCase(repo);
  await uc.execute("eid", "cid");
  assert.equal(id, "eid");
  assert.equal(company, "cid");
});

test("ListPublicLiveEventsUseCase delega", async () => {
  let called = false;
  const repo = createRepo({
    async listPublic() {
      called = true;
      return ok;
    },
  });
  const uc = new ListPublicLiveEventsUseCase(repo);
  await uc.execute();
  assert.equal(called, true);
});

test("CreateLiveEventUseCase delega create sin imagen", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = createRepo({
    async create(data) {
      stored = data;
      return ok;
    },
  });
  const { CreateLiveEventUseCase } = await import(
    "../../../application/live-events/createLiveEventUseCase.js"
  );
  const uc = new CreateLiveEventUseCase(repo);
  await uc.execute(
    {
      name: "Rock al Parque",
      type: "concierto",
      status: "upcoming",
      date: "2026-07-01",
      time: "18:00",
      place: "Bogotá, Colombia",
      latitude: 4.711,
      longitude: -74.072,
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.name, "Rock al Parque");
  assert.equal(stored?.latitude, 4.711);
  assert.equal(stored?.longitude, -74.072);
  assert.ok(stored?.eventDate instanceof Date);
  assert.equal("date" in (stored ?? {}), false);
});
