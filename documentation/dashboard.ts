const authHeader = {
  name: "Authorization",
  in: "header",
  type: "string",
  description: "Bearer JWT del usuario (empresa activa en el token)",
  required: true,
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const getDashboard = {
  get: {
    tags: ["Dashboard"],
    summary: "Resumen del panel administrativo",
    description:
      "Devuelve productos recientemente agotados, actividad reciente unificada de todos los módulos de contenido y contadores por módulo. La tienda pública y métricas avanzadas de tienda quedan para una fase posterior.",
    parameters: [
      authHeader,
      {
        name: "recentItemsLimit",
        in: "query",
        required: false,
        type: "string",
        description: "Máximo de ítems en el listado unificado (default 20, máx. 50)",
      },
      {
        name: "outOfStockLimit",
        in: "query",
        required: false,
        type: "string",
        description:
          "Máximo de productos agotados recientes (default 10, máx. 30)",
      },
    ],
    responses: {
      200: {
        description: "Resumen del dashboard",
        schema: { $ref: "#/definitions/DashboardSummary" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  DashboardSummary: {
    type: "object",
    properties: {
      recentlyOutOfStockProducts: {
        type: "array",
        items: { $ref: "#/definitions/DashboardOutOfStockProduct" },
      },
      recentItems: {
        type: "array",
        items: { $ref: "#/definitions/DashboardRecentItem" },
      },
      totals: { $ref: "#/definitions/DashboardTotals" },
    },
  },
  DashboardOutOfStockProduct: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      status: { type: "string", enum: ["agotado"] },
      stock: { type: "integer" },
      date: { type: "string", format: "date-time" },
    },
  },
  DashboardRecentItem: {
    type: "object",
    properties: {
      id: { type: "string" },
      module: {
        type: "string",
        enum: [
          "news",
          "entrepreneurship",
          "liveEvents",
          "multimedia",
          "services",
          "storeCategory",
          "storeProduct",
        ],
      },
      title: { type: "string" },
      status: { type: "string" },
      date: { type: "string", format: "date-time" },
    },
  },
  DashboardTotals: {
    type: "object",
    properties: {
      news: { $ref: "#/definitions/DashboardContentCounts" },
      entrepreneurship: { $ref: "#/definitions/DashboardContentCounts" },
      liveEvents: { $ref: "#/definitions/DashboardLiveEventCounts" },
      multimedia: { $ref: "#/definitions/DashboardContentCounts" },
      services: { $ref: "#/definitions/DashboardContentCounts" },
      storeCategories: { $ref: "#/definitions/DashboardStoreCategoryCounts" },
      storeProducts: { $ref: "#/definitions/DashboardStoreProductCounts" },
    },
  },
  DashboardContentCounts: {
    type: "object",
    properties: {
      total: { type: "integer" },
      draft: { type: "integer" },
      published: { type: "integer" },
      inactive: {
        type: "integer",
        description: "En noticias equivale a archivadas",
      },
    },
  },
  DashboardLiveEventCounts: {
    type: "object",
    properties: {
      total: { type: "integer" },
      upcoming: { type: "integer" },
      ongoing: { type: "integer" },
      finished: { type: "integer" },
      cancelled: { type: "integer" },
    },
  },
  DashboardStoreCategoryCounts: {
    type: "object",
    properties: {
      total: { type: "integer" },
      active: { type: "integer" },
      inactive: { type: "integer" },
    },
  },
  DashboardStoreProductCounts: {
    type: "object",
    properties: {
      total: { type: "integer" },
      active: { type: "integer" },
      inactive: { type: "integer" },
      outOfStock: { type: "integer" },
    },
  },
};

export default {
  getDashboard,
  definitions,
};
