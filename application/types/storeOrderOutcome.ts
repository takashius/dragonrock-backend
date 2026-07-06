/** Resultado estándar de casos de pedidos de tienda. */
export type StoreOrderOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type StoreOrderStatus =
  | "pendiente"
  | "confirmado"
  | "enviado"
  | "cancelado";

export type StoreOrderCustomerInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type StoreOrderLineItemInput = {
  productId: string;
  quantity: number;
};

export type StoreOrderLineItemSnapshot = {
  productId: string;
  name: string;
  slug: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};
