/**
 * Punto de entrada de composición HTTP: reexporta los cables por módulo.
 * Añade nuevos dominios como `wireXxx.ts` e importa aquí para mantener imports estables (`./wireHttpApi.js`).
 */
export { wireUserHttpStack } from "./wireUserHttpStack.js";
export { wireNewsRouter } from "./wireNewsRouter.js";
export { wireEntrepreneurshipRouter } from "./wireEntrepreneurshipRouter.js";
export { wireLiveEventsRouter } from "./wireLiveEventsRouter.js";
export { wireMultimediaRouter } from "./wireMultimediaRouter.js";
export { wireServicesRouter } from "./wireServicesRouter.js";
export { wireStoreCategoriesRouter } from "./wireStoreCategoriesRouter.js";
export { wireStoreProductsRouter } from "./wireStoreProductsRouter.js";
export { wireDashboardRouter } from "./wireDashboardRouter.js";
export { wirePublicHomeRouter } from "./wirePublicHomeRouter.js";
export { wireMediaRouter } from "./wireMediaRouter.js";
