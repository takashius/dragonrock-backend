import type { Response, Request } from "express";
import type { UserOutcome } from "../../application/types/userOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

export function sendUserOutcomeWithDetail(
  res: Response,
  req: Request,
  outcome: UserOutcome
): void {
  if ("detail" in outcome && outcome.detail) {
    sendStoreDetailError(outcome.detail, req, res);
    return;
  }
  res.status(outcome.status).send(outcome.message);
}
