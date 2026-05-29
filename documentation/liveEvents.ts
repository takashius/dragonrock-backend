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
  description: "ObjectId del evento (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const publicListLiveEvents = {
  get: {
    tags: ["LiveEvents"],
    summary: "Listado público de eventos en vivo",
    description:
      "Retorna eventos activos que no están cancelados, ordenados por fecha.",
    responses: {
      200: { description: "Lista pública de eventos" },
      500: { description: "Error inesperado" },
    },
  },
};

const paginateLiveEvents = {
  get: {
    tags: ["LiveEvents"],
    summary: "Eventos paginados (búsqueda y filtros)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description: "Busca en nombre, lugar y dirección",
      },
      {
        name: "filter",
        in: "query",
        required: false,
        type: "string",
        description: "Alias legacy de `search`",
      },
      {
        name: "type",
        in: "query",
        required: false,
        type: "string",
        enum: ["concierto", "festival", "cultural", "otro"],
      },
      {
        name: "status",
        in: "query",
        required: false,
        type: "string",
        enum: ["upcoming", "ongoing", "finished", "cancelled"],
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
        description: "Ítems por página (por defecto 20, máx. 100)",
      },
    ],
    responses: {
      200: { description: "Resultado paginado" },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const liveEventById = {
  get: {
    tags: ["LiveEvents"],
    summary: "Detalle de evento (admin)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Evento" },
      400: validation400,
      401: { description: "No autorizado" },
      404: { description: "No encontrado" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["LiveEvents"],
    summary: "Eliminar evento (soft delete)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Evento eliminado",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const publicLiveEventById = {
  get: {
    tags: ["LiveEvents"],
    summary: "Detalle público de evento",
    parameters: [mongoIdPathParam],
    responses: {
      200: { description: "Evento disponible públicamente" },
      400: validation400,
      404: { description: "No encontrado o no disponible" },
      500: { description: "Error inesperado" },
    },
  },
};

const createLiveEvent = {
  post: {
    tags: ["LiveEvents"],
    summary: "Crear evento en vivo",
    description:
      "Acepta JSON o multipart/form-data. Si envías `image` como archivo, se sube a Cloudinary y se guarda la URL.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/LiveEventInput" },
      },
    ],
    responses: {
      200: { description: "Evento creado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description:
          "Cloudinary no configurado cuando se intenta registrar `image`",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const updateLiveEvent = {
  patch: {
    tags: ["LiveEvents"],
    summary: "Actualizar evento en vivo",
    description:
      "Acepta JSON o multipart/form-data. Nueva `image` reemplaza la anterior en Cloudinary.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/LiveEventPatch" },
      },
    ],
    responses: {
      200: { description: "Actualizado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description:
          "Cloudinary no configurado cuando se intenta actualizar `image`",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  LiveEventInput: {
    type: "object",
    required: ["name", "type", "status", "date", "time", "place"],
    properties: {
      name: { type: "string" },
      type: {
        type: "string",
        enum: ["concierto", "festival", "cultural", "otro"],
      },
      status: {
        type: "string",
        enum: ["upcoming", "ongoing", "finished", "cancelled"],
      },
      date: {
        type: "string",
        description: "Fecha del evento (YYYY-MM-DD)",
      },
      time: {
        type: "string",
        description: "Hora del evento (HH:mm)",
      },
      place: { type: "string", description: "Ciudad o región" },
      address: { type: "string", description: "Dirección concreta" },
      latitude: {
        type: "number",
        minimum: -90,
        maximum: 90,
        description: "Opcional",
      },
      longitude: {
        type: "number",
        minimum: -180,
        maximum: 180,
        description: "Opcional",
      },
      price: {
        type: "number",
        minimum: 0,
        description: "Precio numérico; 0 para eventos gratuitos",
      },
      description: { type: "string" },
      image: {
        type: "string",
        description: "Data URI, URL remota o archivo multipart `image`",
      },
      isFeatured: { type: "boolean" },
    },
  },
  LiveEventPatch: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      name: { type: "string" },
      type: {
        type: "string",
        enum: ["concierto", "festival", "cultural", "otro"],
      },
      status: {
        type: "string",
        enum: ["upcoming", "ongoing", "finished", "cancelled"],
      },
      date: { type: "string" },
      time: { type: "string" },
      place: { type: "string" },
      address: { type: "string" },
      latitude: { type: "number" },
      longitude: { type: "number" },
      price: { type: "number", minimum: 0 },
      description: { type: "string" },
      image: { type: "string" },
      isFeatured: { type: "boolean" },
    },
  },
};

export default {
  publicListLiveEvents,
  paginateLiveEvents,
  liveEventById,
  publicLiveEventById,
  createLiveEvent,
  updateLiveEvent,
  definitions,
};
