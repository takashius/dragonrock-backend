import type { Request, Response } from "express";
import type { StoreOrderOutcome } from "../../application/types/storeOrderOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

export function sendStoreOrderOutcome(
  res: Response,
  req: Request,
  outcome: StoreOrderOutcome
): void {
  if (outcome.status === 200 || outcome.status === 201) {
    res.status(outcome.status).send(outcome.message);
    return;
  }
  if (outcome.status === 404) {
    res.status(404).send(outcome.message);
    return;
  }
  if ("detail" in outcome && outcome.detail) {
    sendStoreDetailError(outcome.detail, req, res);
    return;
  }
  res.status(outcome.status).send(outcome.message);
}
