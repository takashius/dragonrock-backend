import type { Request, Response } from "express";
import controllerError from "../../middelware/controllerError.js";

/**
 * Adaptador fino: la capa de presentación no importa `controllerError` en cada mapper.
 */
export function sendStoreDetailError(
  detail: unknown,
  req: Request,
  res: Response
): void {
  controllerError(detail, req, res);
}
