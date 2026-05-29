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
  description: "ObjectId de la entrevista (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const publicListEntrepreneurship = {
  get: {
    tags: ["Entrepreneurship"],
    summary: "Listado público de entrevistas publicadas (Emprende)",
    description: "Retorna solo entrevistas con status `published` y activas.",
    responses: {
      200: { description: "Lista pública de entrevistas" },
      500: { description: "Error inesperado" },
    },
  },
};

const paginateEntrepreneurship = {
  get: {
    tags: ["Entrepreneurship"],
    summary: "Entrevistas paginadas (búsqueda y página)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description:
          "Busca en nombre del emprendedor, negocio y rubro",
      },
      {
        name: "filter",
        in: "query",
        required: false,
        type: "string",
        description: "Alias legacy de `search`",
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

const entrepreneurshipById = {
  get: {
    tags: ["Entrepreneurship"],
    summary: "Detalle de entrevista (admin)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Entrevista" },
      400: validation400,
      401: { description: "No autorizado" },
      404: { description: "No encontrada" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["Entrepreneurship"],
    summary: "Eliminar entrevista (soft delete)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Entrevista eliminada",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const publicEntrepreneurshipById = {
  get: {
    tags: ["Entrepreneurship"],
    summary: "Detalle público de entrevista publicada",
    parameters: [mongoIdPathParam],
    responses: {
      200: { description: "Entrevista publicada" },
      400: validation400,
      404: { description: "No encontrada o no publicada" },
      500: { description: "Error inesperado" },
    },
  },
};

const createEntrepreneurship = {
  post: {
    tags: ["Entrepreneurship"],
    summary: "Crear entrevista Emprende",
    description:
      "Acepta JSON o multipart/form-data. Si envías `featuredImage` como archivo, se sube a Cloudinary y se guarda la URL.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/EntrepreneurshipInput" },
      },
    ],
    responses: {
      200: { description: "Entrevista creada" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description:
          "Cloudinary no configurado cuando se intenta registrar `featuredImage`",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const updateEntrepreneurship = {
  patch: {
    tags: ["Entrepreneurship"],
    summary: "Actualizar entrevista Emprende",
    description:
      "Acepta JSON o multipart/form-data. Nueva `featuredImage` reemplaza la anterior en Cloudinary.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/EntrepreneurshipPatch" },
      },
    ],
    responses: {
      200: { description: "Actualizada" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description:
          "Cloudinary no configurado cuando se intenta actualizar `featuredImage`",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  InterviewQuestion: {
    type: "object",
    required: ["question", "answer"],
    properties: {
      question: { type: "string" },
      answer: { type: "string", description: "HTML de la respuesta" },
    },
  },
  EntrepreneurshipInput: {
    type: "object",
    required: [
      "entrepreneurName",
      "businessName",
      "category",
      "status",
      "introduction",
      "questions",
    ],
    properties: {
      entrepreneurName: { type: "string" },
      businessName: { type: "string" },
      role: { type: "string" },
      category: { type: "string" },
      location: { type: "string" },
      website: { type: "string" },
      status: {
        type: "string",
        enum: ["draft", "published"],
      },
      isFeatured: { type: "boolean" },
      featuredImage: {
        type: "string",
        description: "Data URI, URL remota o archivo multipart `featuredImage`",
      },
      featuredQuote: { type: "string" },
      introduction: { type: "string", description: "HTML" },
      questions: {
        type: "array",
        minItems: 1,
        items: { $ref: "#/definitions/InterviewQuestion" },
      },
      keyLearnings: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  EntrepreneurshipPatch: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      entrepreneurName: { type: "string" },
      businessName: { type: "string" },
      role: { type: "string" },
      category: { type: "string" },
      location: { type: "string" },
      website: { type: "string" },
      status: {
        type: "string",
        enum: ["draft", "published"],
      },
      isFeatured: { type: "boolean" },
      featuredImage: { type: "string" },
      featuredQuote: { type: "string" },
      introduction: { type: "string" },
      questions: {
        type: "array",
        minItems: 1,
        items: { $ref: "#/definitions/InterviewQuestion" },
      },
      keyLearnings: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
};

export default {
  publicListEntrepreneurship,
  paginateEntrepreneurship,
  entrepreneurshipById,
  publicEntrepreneurshipById,
  createEntrepreneurship,
  updateEntrepreneurship,
  definitions,
};
