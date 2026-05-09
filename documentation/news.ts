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
    summary: "Noticias paginadas (filtro y página)",
    parameters: [
      authHeader,
      {
        name: "filter",
        in: "query",
        required: false,
        type: "string",
      },
      {
        name: "page",
        in: "query",
        required: false,
        type: "string",
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
      200: { description: "Eliminada" },
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
      500: { description: "Error inesperado" },
    },
  },
};

const updateNews = {
  patch: {
    tags: ["News"],
    summary: "Actualizar noticia",
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
      image: { type: "string" },
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
      image: { type: "string" },
      tags: {
        type: "array",
        items: { type: "string" },
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
