import type { Request, Response } from "express";
import type { StoreCategoryOutcome } from "../../application/types/storeCategoryOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

/**
 * Mapea `StoreCategoryOutcome` a respuesta Express.
 */
export function sendStoreCategoryOutcome(
  res: Response,
  req: Request,
  outcome: StoreCategoryOutcome
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
