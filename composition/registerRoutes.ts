import type { Express } from "express";
import { wireNewsRouter, wireUserHttpStack } from "./wireHttpApi.js";

/**
 * Registro de rutas Express (fase 5: montaje mínimo; el cableado vive en wireHttpApi.ts).
 *
 * Capas migradas: modelos Mongoose bajo components, application, infrastructure,
 * presentation/http y composition.
 */
const API_PREFIX = "";

export function registerRoutes(app: Express): void {
  const { auth, userRouter } = wireUserHttpStack();
  app.use(`${API_PREFIX}/user`, userRouter);
  app.use(`${API_PREFIX}/news`, wireNewsRouter(auth));
}
