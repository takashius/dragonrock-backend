/**
 * Punto de entrada de composición HTTP: reexporta los cables por módulo.
 * Añade nuevos dominios como `wireXxx.ts` e importa aquí para mantener imports estables (`./wireHttpApi.js`).
 */
export { wireUserHttpStack } from "./wireUserHttpStack.js";
export { wireNewsRouter } from "./wireNewsRouter.js";
export { wireMediaRouter } from "./wireMediaRouter.js";
