import type { Express } from "express";
import userRouter from "../components/user/network.js";
import newsRouter from "../components/news/network.js";

/** Prefijo global de la API (vacío = raíz). */
const API_PREFIX = "";

/**
 * Punto único donde se montan las rutas HTTP.
 * En fases siguientes los routers importados vendrán de `presentation/http/`
 * y recibirán casos de uso inyectados desde aquí.
 */
export function registerRoutes(app: Express): void {
  app.use(`${API_PREFIX}/user`, userRouter);
  app.use(`${API_PREFIX}/news`, newsRouter);
}
