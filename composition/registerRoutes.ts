import type { Express } from "express";
import { wireMediaRouter, wireNewsRouter, wireUserHttpStack } from "./wireHttpApi.js";

/**
 * Registro de rutas Express (montaje mínimo). El cableado por módulo vive en
 * `wireUserHttpStack.ts`, `wireNewsRouter.ts` (reexportados por `wireHttpApi.ts`).
 */
const API_PREFIX = "";

export function registerRoutes(app: Express): void {
  const { auth, userRouter } = wireUserHttpStack();
  app.use(`${API_PREFIX}/user`, userRouter);
  app.use(`${API_PREFIX}/news`, wireNewsRouter(auth));
  app.use(`${API_PREFIX}/media`, wireMediaRouter(auth));
}
