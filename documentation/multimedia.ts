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
  description: "ObjectId del contenido (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const publicListMultimedia = {
  get: {
    tags: ["Multimedia"],
    summary: "Listado público de contenido multimedia publicado",
    responses: {
      200: { description: "Lista pública" },
      500: { description: "Error inesperado" },
    },
  },
};

const paginateMultimedia = {
  get: {
    tags: ["Multimedia"],
    summary: "Contenido multimedia paginado (búsqueda y filtros)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description: "Busca en título y descripción",
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
        enum: ["video", "podcast", "gallery"],
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

const multimediaById = {
  get: {
    tags: ["Multimedia"],
    summary: "Detalle de contenido multimedia (admin)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Contenido multimedia" },
      400: validation400,
      401: { description: "No autorizado" },
      404: { description: "No encontrado" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["Multimedia"],
    summary: "Eliminar contenido multimedia (soft delete)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Contenido eliminado",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const publicMultimediaById = {
  get: {
    tags: ["Multimedia"],
    summary: "Detalle público de contenido publicado",
    parameters: [mongoIdPathParam],
    responses: {
      200: { description: "Contenido publicado" },
      400: validation400,
      404: { description: "No encontrado o no publicado" },
      500: { description: "Error inesperado" },
    },
  },
};

const createMultimedia = {
  post: {
    tags: ["Multimedia"],
    summary: "Crear contenido multimedia",
    description:
      "Acepta JSON o multipart/form-data. Campo `image` para portada; `galleryImages[]` repetido para galerías (máx. 20). Video y podcast usan URLs externas.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/MultimediaInput" },
      },
    ],
    responses: {
      200: { description: "Contenido creado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir imágenes",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const updateMultimedia = {
  patch: {
    tags: ["Multimedia"],
    summary: "Actualizar contenido multimedia",
    description:
      "En galerías: `existingGallery` (JSON array de URLs ordenadas) + nuevos `galleryImages[]`. Imágenes que ya no vienen se borran de Cloudinary.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/MultimediaPatch" },
      },
    ],
    responses: {
      200: { description: "Actualizado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir imágenes",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  MultimediaInput: {
    type: "object",
    required: ["title", "type", "status", "date"],
    properties: {
      title: { type: "string" },
      type: {
        type: "string",
        enum: ["video", "podcast", "gallery"],
      },
      status: {
        type: "string",
        enum: ["draft", "published"],
      },
      date: {
        type: "string",
        description: "Fecha del contenido (YYYY-MM-DD)",
      },
      durationOrQuantity: { type: "string" },
      description: { type: "string" },
      image: {
        type: "string",
        description: "Portada: data URI, URL o archivo multipart `image`",
      },
      isFeatured: { type: "boolean" },
      videoUrl: { type: "string", description: "Requerido si type=video" },
      season: { type: "integer", description: "Requerido si type=podcast" },
      episode: { type: "integer", description: "Requerido si type=podcast" },
      podcastUrl: { type: "string", description: "Requerido si type=podcast" },
      galleryImages: {
        type: "array",
        items: { type: "string" },
        description: "Requerido si type=gallery (mín. 1)",
      },
    },
  },
  MultimediaPatch: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      title: { type: "string" },
      type: {
        type: "string",
        enum: ["video", "podcast", "gallery"],
      },
      status: {
        type: "string",
        enum: ["draft", "published"],
      },
      date: { type: "string" },
      durationOrQuantity: { type: "string" },
      description: { type: "string" },
      image: { type: "string" },
      isFeatured: { type: "boolean" },
      videoUrl: { type: "string" },
      season: { type: "integer" },
      episode: { type: "integer" },
      podcastUrl: { type: "string" },
      existingGallery: {
        type: "array",
        items: { type: "string" },
        description: "URLs Cloudinary que se conservan (orden final parcial)",
      },
      galleryImages: {
        type: "array",
        items: { type: "string" },
        description: "Nuevas imágenes (data URI o archivos multipart)",
      },
    },
  },
};

export default {
  publicListMultimedia,
  paginateMultimedia,
  multimediaById,
  publicMultimediaById,
  createMultimedia,
  updateMultimedia,
  definitions,
};
