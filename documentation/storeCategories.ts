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
  description: "ObjectId de la categoría (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const simpleListStoreCategories = {
  get: {
    tags: ["StoreCategories"],
    summary: "Listado simple de categorías (id y nombre)",
    description:
      "Listado no paginado para selects/dropdowns. Solo categorías con `status: activa` (no eliminadas). Devuelve `id` y `name`.",
    parameters: [authHeader],
    responses: {
      200: { description: "Array de { id, name }" },
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const paginateStoreCategories = {
  get: {
    tags: ["StoreCategories"],
    summary: "Categorías paginadas (búsqueda y filtros)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description: "Busca en nombre, slug y descripción",
      },
      {
        name: "filter",
        in: "query",
        required: false,
        type: "string",
        description: "Alias legacy de `search`",
      },
      {
        name: "status",
        in: "query",
        required: false,
        type: "string",
        enum: ["activa", "inactiva"],
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
      200: {
        description:
          "Resultado paginado. Cada ítem incluye `productCount` (productos activos asociados).",
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const storeCategoryById = {
  get: {
    tags: ["StoreCategories"],
    summary: "Detalle de categoría",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Categoría" },
      400: validation400,
      401: { description: "No autorizado" },
      404: { description: "No encontrada" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["StoreCategories"],
    summary: "Eliminar categoría (soft delete)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Categoría eliminada",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const createStoreCategory = {
  post: {
    tags: ["StoreCategories"],
    summary: "Crear categoría",
    description:
      "Acepta JSON o multipart/form-data. Campo `image` para portada (Cloudinary).",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/StoreCategoryInput" },
      },
    ],
    responses: {
      200: { description: "Categoría creada" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir imagen",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const updateStoreCategory = {
  patch: {
    tags: ["StoreCategories"],
    summary: "Actualizar categoría",
    description:
      "Acepta JSON o multipart/form-data. Nueva `image` reemplaza portada en Cloudinary.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/StoreCategoryPatch" },
      },
    ],
    responses: {
      200: { description: "Actualizada" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir imagen",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  StoreCategoryInput: {
    type: "object",
    required: ["name", "slug", "status"],
    properties: {
      name: { type: "string" },
      slug: {
        type: "string",
        description: "Slug URL (minúsculas, guiones)",
      },
      description: { type: "string" },
      status: {
        type: "string",
        enum: ["activa", "inactiva"],
      },
      image: {
        type: "string",
        description: "Portada: data URI, URL o archivo multipart `image`",
      },
    },
  },
  StoreCategoryPatch: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      name: { type: "string" },
      slug: { type: "string" },
      description: { type: "string" },
      status: {
        type: "string",
        enum: ["activa", "inactiva"],
      },
      image: { type: "string" },
    },
  },
};

export default {
  simpleListStoreCategories,
  paginateStoreCategories,
  storeCategoryById,
  createStoreCategory,
  updateStoreCategory,
  definitions,
};
