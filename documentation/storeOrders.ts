const authHeader = {
  name: "Authorization",
  in: "header",
  type: "string",
  description: "Bearer JWT del usuario (empresa activa en el token)",
  required: true,
};

const mongoIdPathParam = {
  name: "id",
  in: "path",
  type: "string",
  required: true,
  description: "ObjectId del pedido (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const createPublicStoreOrder = {
  post: {
    tags: ["StoreOrders", "Public"],
    summary: "Crear pedido público de tienda",
    description:
      "Sin autenticación. Valida productos activos y stock, registra el pedido, descuenta inventario y envía correo al cliente y a la empresa (`COMPANY_DEFAULT`).",
    parameters: [
      {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/CreatePublicStoreOrderBody" },
      },
    ],
    responses: {
      201: { description: "Pedido creado con número de orden" },
      400: validation400,
      409: { description: "Stock insuficiente" },
      429: { description: "Demasiadas peticiones" },
      500: { description: "Error inesperado" },
    },
  },
};

const paginateStoreOrders = {
  get: {
    tags: ["StoreOrders"],
    summary: "Pedidos paginados (admin)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description: "Busca por número, cliente, producto o SKU",
      },
      {
        name: "status",
        in: "query",
        required: false,
        type: "string",
        enum: ["pendiente", "confirmado", "enviado", "cancelado"],
      },
      {
        name: "page",
        in: "query",
        required: false,
        type: "string",
      },
      {
        name: "pageSize",
        in: "query",
        required: false,
        type: "string",
      },
    ],
    responses: {
      200: { description: "Listado paginado de pedidos" },
      401: { description: "No autorizado" },
      400: validation400,
      500: { description: "Error inesperado" },
    },
  },
};

const storeOrderById = {
  get: {
    tags: ["StoreOrders"],
    summary: "Detalle de pedido (admin)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Pedido con líneas e info del cliente" },
      401: { description: "No autorizado" },
      404: { description: "No encontrado" },
      400: validation400,
      500: { description: "Error inesperado" },
    },
  },
};

const updateStoreOrder = {
  patch: {
    tags: ["StoreOrders"],
    summary: "Actualizar estado de pedido (admin)",
    description:
      "Cambia el `status` del pedido. Valores: `pendiente`, `confirmado`, `enviado`, `cancelado`.",
    parameters: [
      authHeader,
      {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/UpdateStoreOrderBody" },
      },
    ],
    responses: {
      200: { description: "Pedido actualizado" },
      401: { description: "No autorizado" },
      404: { description: "Pedido no encontrado" },
      400: validation400,
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  CreatePublicStoreOrderBody: {
    type: "object",
    required: ["customer", "items"],
    properties: {
      customer: {
        type: "object",
        required: ["name", "email", "phone", "address"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          address: { type: "string" },
        },
      },
      items: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: {
              type: "string",
              pattern: "^[a-fA-F0-9]{24}$",
            },
            quantity: { type: "integer", minimum: 1 },
          },
        },
      },
      notes: { type: "string" },
    },
  },
  UpdateStoreOrderBody: {
    type: "object",
    required: ["id", "status"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      status: {
        type: "string",
        enum: ["pendiente", "confirmado", "enviado", "cancelado"],
      },
    },
  },
};

export default {
  createPublicStoreOrder,
  paginateStoreOrders,
  storeOrderById,
  updateStoreOrder,
  definitions,
};
