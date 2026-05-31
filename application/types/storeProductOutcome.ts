/** Resultado estándar de casos de productos de tienda. */
export type StoreProductOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type StoreProductStatus = "activo" | "inactivo" | "agotado";
