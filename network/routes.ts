import type { Express } from "express";
import { registerRoutes } from "../composition/registerRoutes.js";

/**
 * Entrada de enrutado para `index.ts`.
 * Delega en la composición para mantener un solo lugar de registro de rutas.
 */
const routes = function (server: Express): void {
  registerRoutes(server);
};

export default routes;
