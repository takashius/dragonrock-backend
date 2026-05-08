const authHeader = {
  name: "Authorization",
  in: "header",
  type: "string",
  description: "Bearer JWT del usuario (empresa activa en el token)",
  required: true,
};

const listNews = {
  get: {
    tags: ["News"],
    summary: "Listar noticias de la empresa del usuario",
    parameters: [authHeader],
    responses: {
      200: { description: "Lista de noticias" },
      401: { description: "No autorizado" },
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
      401: { description: "No autorizado" },
    },
  },
};

const newsById = {
  get: {
    tags: ["News"],
    summary: "Detalle de una noticia",
    parameters: [
      authHeader,
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: { description: "Noticia" },
      400: { description: "No encontrada u error" },
      401: { description: "No autorizado" },
    },
  },
  delete: {
    tags: ["News"],
    summary: "Eliminar noticia (soft delete)",
    parameters: [
      authHeader,
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: { description: "Eliminada" },
      400: { description: "Error" },
      401: { description: "No autorizado" },
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
      201: { description: "Creada" },
      400: { description: "Validación u error" },
      401: { description: "No autorizado" },
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
      400: { description: "Error" },
      401: { description: "No autorizado" },
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
      id: { type: "string" },
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
