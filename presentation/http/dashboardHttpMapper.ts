import type { Request, Response } from "express";
import type { DashboardOutcome } from "../../application/types/dashboardOutcome.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";

export function sendDashboardOutcome(
  res: Response,
  req: Request,
  outcome: DashboardOutcome
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
