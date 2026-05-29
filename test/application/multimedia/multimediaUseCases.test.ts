import test from "node:test";
import assert from "node:assert/strict";
import type { MultimediaRepository } from "../../../application/ports/multimediaRepository.js";
import type { MultimediaOutcome } from "../../../application/types/multimediaOutcome.js";
import { PaginateMultimediaUseCase } from "../../../application/multimedia/paginateMultimediaUseCase.js";
import { CreateMultimediaUseCase } from "../../../application/multimedia/createMultimediaUseCase.js";

const ok: MultimediaOutcome = { status: 200, message: [] };

function createRepo(
  overrides: Partial<MultimediaRepository> = {}
): MultimediaRepository {
  return {
    listPublished: async () => ok,
    getPublishedDetail: async () => ok,
    getDetail: async () => ok,
    paginate: async () => ok,
    create: async () => ok,
    update: async () => ok,
    softDelete: async () => ok,
    ...overrides,
  } as MultimediaRepository;
}

test("PaginateMultimediaUseCase delega con companyId y type", async () => {
  let seenType = "";
  const repo = createRepo({
    async paginate(params) {
      seenType = String(params.type ?? "");
      return ok;
    },
  });
  await new PaginateMultimediaUseCase(repo).execute({
    search: "Entrevista",
    filter: undefined,
    type: "video",
    status: "draft",
    page: "1",
    companyId: "c1",
  });
  assert.equal(seenType, "video");
});

test("CreateMultimediaUseCase: video delega sin Cloudinary", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = createRepo({
    async create(data) {
      stored = data;
      return ok;
    },
  });
  await new CreateMultimediaUseCase(repo).execute(
    {
      title: "Entrevista",
      type: "video",
      status: "draft",
      date: "2026-05-27",
      videoUrl: "https://youtube.com/watch?v=abc",
    },
    "u1",
    "c1"
  );
  assert.equal(stored?.title, "Entrevista");
  assert.equal(stored?.videoUrl, "https://youtube.com/watch?v=abc");
  assert.equal(stored?.contentDate instanceof Date, true);
  assert.equal("galleryImages" in (stored ?? {}), false);
});
