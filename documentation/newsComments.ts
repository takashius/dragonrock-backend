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
  description: "ObjectId (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const publicNewsComments = {
  get: {
    tags: ["News", "Public"],
    summary: "Listar comentarios públicos de una noticia publicada",
    description:
      "Sin autenticación. Solo comentarios activos de una noticia con status `published`.",
    parameters: [mongoIdPathParam],
    responses: {
      200: {
        description: "Lista de comentarios (más recientes primero)",
        schema: {
          type: "array",
          items: { $ref: "#/definitions/PublicNewsComment" },
        },
      },
      400: validation400,
      404: { description: "Noticia no encontrada o no publicada" },
      500: { description: "Error inesperado" },
    },
  },
  post: {
    tags: ["News", "Public"],
    summary: "Publicar un comentario en una noticia",
    description:
      "Sin autenticación. Requiere nombre para mostrar y texto. En producción exige `captchaToken` de reCAPTCHA. Limitado por rate limit.",
    parameters: [
      mongoIdPathParam,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/CreatePublicNewsCommentBody" },
      },
    ],
    responses: {
      200: {
        description: "Comentario creado",
        schema: { $ref: "#/definitions/PublicNewsComment" },
      },
      400: validation400,
      404: { description: "Noticia no encontrada o no publicada" },
      429: { description: "Demasiadas peticiones" },
      503: { description: "Captcha no configurado" },
      500: { description: "Error inesperado" },
    },
  },
};

const deleteNewsComment = {
  delete: {
    tags: ["News"],
    summary: "Eliminar comentario (soft delete)",
    description:
      "Requiere JWT (`Authorization: Bearer`). Solo el rol `Administrador` puede eliminar, y únicamente comentarios de noticias de su empresa.",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Comentario eliminado (mensaje texto)",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado (sesión inválida o ausente)" },
      403: { description: "El usuario autenticado no es Administrador" },
      404: { description: "Comentario no encontrado" },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  PublicNewsComment: {
    type: "object",
    properties: {
      _id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      authorName: { type: "string" },
      body: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  CreatePublicNewsCommentBody: {
    type: "object",
    required: ["name", "body"],
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 80,
        description: "Nombre para mostrar (invitados o usuarios registrados)",
      },
      body: {
        type: "string",
        minLength: 1,
        maxLength: 2000,
      },
      captchaToken: {
        type: "string",
        description:
          "Token de reCAPTCHA (v2 o v3). Obligatorio cuando el backend tiene `RECAPTCHA_SECRET_KEY`.",
      },
    },
  },
};

export default {
  publicNewsComments,
  deleteNewsComment,
  definitions,
};
