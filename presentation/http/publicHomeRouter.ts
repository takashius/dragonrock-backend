import express, { type Router } from "express";
import type { GetPublicHomeUseCase } from "../../application/publicHome/getPublicHomeUseCase.js";
import { sendPublicHomeOutcome } from "./publicHomeHttpMapper.js";

export type PublicHomeRouterDeps = {
  getPublicHome: GetPublicHomeUseCase;
};

export function createPublicHomeRouter(deps: PublicHomeRouterDeps): Router {
  const router = express.Router();

  router.get("/home", async (req, res) => {
    try {
      const outcome = await deps.getPublicHome.execute();
      sendPublicHomeOutcome(res, req, outcome);
    } catch (e: unknown) {
      console.log("[ERROR] -> getPublicHome", e);
      res.status(500).send("Unexpected Error");
    }
  });

  return router;
}
