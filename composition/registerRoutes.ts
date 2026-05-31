import type { Express } from "express";
import {
  wireEntrepreneurshipRouter,
  wireLiveEventsRouter,
  wireMediaRouter,
  wireMultimediaRouter,
  wireServicesRouter,
  wireStoreCategoriesRouter,
  wireStoreProductsRouter,
  wireNewsRouter,
  wireUserHttpStack,
} from "./wireHttpApi.js";

/**
 * Registro de rutas Express (montaje mínimo). El cableado por módulo vive en
 * `wireUserHttpStack.ts`, `wireNewsRouter.ts` (reexportados por `wireHttpApi.ts`).
 */
const API_PREFIX = "";

export function registerRoutes(app: Express): void {
  const { auth, userRouter } = wireUserHttpStack();
  app.use(`${API_PREFIX}/user`, userRouter);
  app.use(`${API_PREFIX}/news`, wireNewsRouter(auth));
  app.use(
    `${API_PREFIX}/entrepreneurship`,
    wireEntrepreneurshipRouter(auth)
  );
  app.use(`${API_PREFIX}/live-events`, wireLiveEventsRouter(auth));
  app.use(`${API_PREFIX}/multimedia`, wireMultimediaRouter(auth));
  app.use(`${API_PREFIX}/services`, wireServicesRouter(auth));
  app.use(
    `${API_PREFIX}/store/categories`,
    wireStoreCategoriesRouter(auth)
  );
  app.use(`${API_PREFIX}/store/products`, wireStoreProductsRouter(auth));
  app.use(`${API_PREFIX}/media`, wireMediaRouter(auth));
}
