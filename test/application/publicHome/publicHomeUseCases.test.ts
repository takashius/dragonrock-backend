import test from "node:test";
import assert from "node:assert/strict";
import type { PublicHomeRepository } from "../../../application/ports/publicHomeRepository.js";
import { GetPublicHomeUseCase } from "../../../application/publicHome/getPublicHomeUseCase.js";

test("GetPublicHomeUseCase delega en el repositorio", async () => {
  let called = false;
  const repo: PublicHomeRepository = {
    async getHome() {
      called = true;
      return {
        status: 200,
        message: {
          news: [],
          liveEvents: [],
          featuredEntrepreneurs: [],
          featuredProducts: [],
        },
      };
    },
  };

  const out = await new GetPublicHomeUseCase(repo).execute();

  assert.equal(called, true);
  assert.equal(out.status, 200);
  const message = out.message as {
    news: unknown[];
    liveEvents: unknown[];
    featuredEntrepreneurs: unknown[];
    featuredProducts: unknown[];
  };
  assert.ok(Array.isArray(message.news));
  assert.ok(Array.isArray(message.liveEvents));
  assert.deepEqual(message.featuredEntrepreneurs, []);
  assert.ok(Array.isArray(message.featuredProducts));
});
