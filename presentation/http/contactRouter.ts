import express, { type Router } from "express";
import type { SubmitPublicContactUseCase } from "../../application/contact/submitPublicContactUseCase.js";
import { sendContactOutcome } from "./contactHttpMapper.js";
import { validateBody } from "./validateRequest.js";
import { sensitivePublicRateLimiter } from "./rateLimiters.js";
import {
  submitPublicContactBodySchema,
  type SubmitPublicContactBody,
} from "./schemas/routeSchemasContact.js";

export type ContactRouterDeps = {
  submitPublicContact: SubmitPublicContactUseCase;
};

export function createContactRouter(deps: ContactRouterDeps): Router {
  const router = express.Router();

  router.post(
    "/public",
    validateBody(submitPublicContactBodySchema),
    sensitivePublicRateLimiter,
    async (req, res) => {
      try {
        const body = req.body as SubmitPublicContactBody;
        const outcome = await deps.submitPublicContact.execute({
          name: body.name,
          email: body.email,
          phone: body.phone,
          subject: body.subject,
          message: body.message,
        });
        sendContactOutcome(res, req, outcome);
      } catch (e: unknown) {
        console.log("[ERROR] -> submitPublicContact", e);
        res.status(500).send("Unexpected Error");
      }
    }
  );

  return router;
}
