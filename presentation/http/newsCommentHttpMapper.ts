import type { Request, Response } from "express";
import type { NewsCommentOutcome } from "../../application/types/newsCommentOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

export function sendNewsCommentOutcome(
  res: Response,
  req: Request,
  outcome: NewsCommentOutcome
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
