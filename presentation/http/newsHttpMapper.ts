import type { Request, Response } from "express";
import type { NewsOutcome } from "../../application/types/newsOutcome.js";
import controllerError from "../../middelware/controllerError.js";

/**
 * Mapea `NewsOutcome` a respuesta Express (misma semántica que el router anterior).
 */
export function sendNewsOutcome(
  res: Response,
  req: Request,
  news: NewsOutcome
): void {
  if (news.status === 200) {
    res.status(200).send(news.message);
    return;
  }
  if (news.status === 404) {
    res.status(404).send(news.message);
    return;
  }
  if ("detail" in news && news.detail) {
    controllerError(news.detail, req, res);
    return;
  }
  res.status(news.status).send(news.message);
}
