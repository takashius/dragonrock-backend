import type { Request, Response } from "express";
import type { LiveEventOutcome } from "../../application/types/liveEventOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

/**
 * Mapea `LiveEventOutcome` a respuesta Express.
 */
export function sendLiveEventOutcome(
  res: Response,
  req: Request,
  outcome: LiveEventOutcome
): void {
  if (outcome.status === 200) {
    res.status(200).send(outcome.message);
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
