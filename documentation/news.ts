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
  description: "ObjectId de la noticia (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const listNews = {
  get: {
    tags: ["News"],
    summary: "Listar noticias de la empresa del usuario",
    parameters: [authHeader],
    responses: {
      200: { description: "Lista de noticias" },
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const paginateNews = {
  get: {
    tags: ["News"],
    summary: "Noticias paginadas (search/type y página)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description: "Texto libre para buscar en el título de la noticia",
      },
      {
        name: "filter",
        in: "query",
        required: false,
        type: "string",
        description:
          "Alias legacy de `search` (compatibilidad con versiones previas)",
      },
      {
        name: "type",
        in: "query",
        required: false,
        type: "string",
        enum: ["escenaRock", "culturales", "other"],
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
        description:
          "Cantidad de ítems por página. Si no se envía, usa el valor por defecto del backend (20).",
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

const newsById = {
  get: {
    tags: ["News"],
    summary: "Detalle de una noticia",
    description:
      "Incluye metadatos de creación y `history` de ediciones (quién editó y cuándo).",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Noticia" },
      400: validation400,
      401: { description: "No autorizado" },
      404: { description: "Noticia no encontrada" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["News"],
    summary: "Eliminar noticia (soft delete)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Noticia eliminada (mensaje texto)",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const createNews = {
  post: {
    tags: ["News"],
    summary: "Crear noticia",
    description:
      "Acepta JSON o multipart/form-data. Si envías `image` como archivo, se sube a Cloudinary y se guarda la URL en la noticia.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/NewsInput" },
      },
    ],
    responses: {
      200: { description: "Noticia creada (cuerpo = documento guardado)" },
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

const updateNews = {
  patch: {
    tags: ["News"],
    summary: "Actualizar noticia",
    description:
      "Acepta JSON o multipart/form-data. Si envías una nueva `image`, se sube a Cloudinary, se guarda la nueva URL y se intenta borrar la imagen previa.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/NewsPatch" },
      },
    ],
    responses: {
      200: { description: "Actualizada" },
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
  NewsInput: {
    type: "object",
    required: ["title", "type", "status"],
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      content: { type: "string" },
      type: {
        type: "string",
        enum: ["escenaRock", "culturales", "other"],
      },
      status: {
        type: "string",
        enum: ["draft", "published", "archived"],
      },
      image: {
        type: "string",
        description:
          "Imagen de entrada (data URI o URL remota). Se sube a Cloudinary y se guarda la URL final.",
      },
      tags: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  NewsPatch: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
        description: "ObjectId de la noticia",
      },
      title: { type: "string" },
      description: { type: "string" },
      content: { type: "string" },
      type: {
        type: "string",
        enum: ["escenaRock", "culturales", "other"],
      },
      status: {
        type: "string",
        enum: ["draft", "published", "archived"],
      },
      image: {
        type: "string",
        description:
          "Nueva imagen (data URI o URL remota). Reemplaza la imagen previa en Cloudinary.",
      },
      tags: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  NewsHistoryEntry: {
    type: "object",
    properties: {
      user: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
        description: "Usuario que realizó la edición",
      },
      date: {
        type: "string",
        format: "date-time",
        description: "Fecha/hora del cambio",
      },
    },
  },
};

export default {
  listNews,
  paginateNews,
  newsById,
  createNews,
  updateNews,
  definitions,
};
