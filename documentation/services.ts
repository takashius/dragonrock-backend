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
  description: "ObjectId del servicio (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const publicListServices = {
  get: {
    tags: ["Services"],
    summary: "Listado público de servicios publicados",
    responses: {
      200: { description: "Lista pública de servicios" },
      500: { description: "Error inesperado" },
    },
  },
};

const paginateServices = {
  get: {
    tags: ["Services"],
    summary: "Servicios paginados (búsqueda y filtros)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description: "Busca en nombre, slug, descripciones y tags",
      },
      {
        name: "filter",
        in: "query",
        required: false,
        type: "string",
        description: "Alias legacy de `search`",
      },
      {
        name: "category",
        in: "query",
        required: false,
        type: "string",
        enum: [
          "desarrolloWeb",
          "disenoGrafico",
          "marketingDigital",
          "personalizacion",
          "produccionMusical",
          "fotografia",
          "otro",
        ],
      },
      {
        name: "status",
        in: "query",
        required: false,
        type: "string",
        enum: ["draft", "published"],
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

const serviceById = {
  get: {
    tags: ["Services"],
    summary: "Detalle de servicio (admin)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Servicio" },
      400: validation400,
      401: { description: "No autorizado" },
      404: { description: "No encontrado" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["Services"],
    summary: "Eliminar servicio (soft delete)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Servicio eliminado",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const publicServiceById = {
  get: {
    tags: ["Services"],
    summary: "Detalle público de servicio publicado",
    parameters: [mongoIdPathParam],
    responses: {
      200: { description: "Servicio publicado" },
      400: validation400,
      404: { description: "No encontrado o no publicado" },
      500: { description: "Error inesperado" },
    },
  },
};

const createService = {
  post: {
    tags: ["Services"],
    summary: "Crear servicio",
    description:
      "Acepta JSON o multipart/form-data. Campo `image` para portada (Cloudinary).",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/ServiceInput" },
      },
    ],
    responses: {
      200: { description: "Servicio creado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir portada",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const updateService = {
  patch: {
    tags: ["Services"],
    summary: "Actualizar servicio",
    description:
      "Acepta JSON o multipart/form-data. Nueva `image` reemplaza portada en Cloudinary.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/ServicePatch" },
      },
    ],
    responses: {
      200: { description: "Actualizado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir portada",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  ServiceInput: {
    type: "object",
    required: ["name", "slug", "category", "status", "shortDescription"],
    properties: {
      name: { type: "string" },
      slug: {
        type: "string",
        description: "Slug URL (minúsculas, guiones)",
      },
      category: {
        type: "string",
        enum: [
          "desarrolloWeb",
          "disenoGrafico",
          "marketingDigital",
          "personalizacion",
          "produccionMusical",
          "fotografia",
          "otro",
        ],
      },
      status: {
        type: "string",
        enum: ["draft", "published"],
      },
      price: {
        type: "number",
        minimum: 0,
        description: "Opcional; vacío = A consultar",
      },
      showPriceFrom: { type: "boolean" },
      shortDescription: {
        type: "string",
        maxLength: 200,
      },
      fullDescription: { type: "string", description: "HTML" },
      image: {
        type: "string",
        description: "Portada: data URI, URL o archivo multipart `image`",
      },
      contactUrl: { type: "string" },
      tags: {
        type: "array",
        items: { type: "string" },
      },
      isFeatured: { type: "boolean" },
    },
  },
  ServicePatch: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      name: { type: "string" },
      slug: { type: "string" },
      category: {
        type: "string",
        enum: [
          "desarrolloWeb",
          "disenoGrafico",
          "marketingDigital",
          "personalizacion",
          "produccionMusical",
          "fotografia",
          "otro",
        ],
      },
      status: {
        type: "string",
        enum: ["draft", "published"],
      },
      price: { type: "number" },
      showPriceFrom: { type: "boolean" },
      shortDescription: { type: "string" },
      fullDescription: { type: "string" },
      image: { type: "string" },
      contactUrl: { type: "string" },
      tags: {
        type: "array",
        items: { type: "string" },
      },
      isFeatured: { type: "boolean" },
      clearPrice: { type: "boolean" },
    },
  },
};

export default {
  publicListServices,
  paginateServices,
  serviceById,
  publicServiceById,
  createService,
  updateService,
  definitions,
};
