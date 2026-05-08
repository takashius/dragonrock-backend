import type { Response, Request } from "express";
import type { UserOutcome } from "../../application/types/userOutcome.js";
import controllerError from "../../middelware/controllerError.js";

export function sendUserOutcomeWithDetail(
  res: Response,
  req: Request,
  outcome: UserOutcome
): void {
  if ("detail" in outcome && outcome.detail) {
    controllerError(outcome.detail, req, res);
    return;
  }
  res.status(outcome.status).send(outcome.message);
}
