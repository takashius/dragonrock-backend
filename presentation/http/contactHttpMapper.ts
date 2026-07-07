import type { Request, Response } from "express";
import type { ContactOutcome } from "../../application/types/contactOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

export function sendContactOutcome(
  res: Response,
  req: Request,
  outcome: ContactOutcome
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
