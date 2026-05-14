import type { Request, Response } from "express";
import type { MediaOutcome } from "../../application/types/mediaOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

export function sendMediaOutcome(
  res: Response,
  req: Request,
  outcome: MediaOutcome
): void {
  if (outcome.status === 200) {
    res.status(200).send(outcome.message);
    return;
  }

  if ("detail" in outcome && outcome.detail) {
    sendStoreDetailError(outcome.detail, req, res);
    return;
  }

  res.status(outcome.status).send(outcome.message);
}
