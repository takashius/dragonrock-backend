const authHeader = {
  name: "Authorization",
  in: "header",
  type: "string",
  description: "Bearer JWT del usuario",
  required: true,
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const uploadMedia = {
  post: {
    tags: ["Media"],
    summary: "Subir archivo a Cloudinary",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/MediaUploadBody" },
      },
    ],
    responses: {
      200: { description: "Archivo subido" },
      400: validation400,
      401: { description: "No autorizado" },
      503: { description: "Cloudinary no configurado" },
    },
  },
};

const destroyMedia = {
  post: {
    tags: ["Media"],
    summary: "Eliminar archivo en Cloudinary por publicId",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/MediaDeleteBody" },
      },
    ],
    responses: {
      200: { description: "Archivo eliminado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: { description: "Cloudinary no configurado" },
    },
  },
};

const definitions = {
  MediaUploadBody: {
    type: "object",
    required: ["source"],
    properties: {
      source: {
        type: "string",
        description: "Data URI, URL remota o ruta temporal aceptada por Cloudinary",
      },
      folder: { type: "string" },
      publicId: { type: "string" },
      resourceType: {
        type: "string",
        enum: ["image", "video", "raw", "auto"],
      },
    },
  },
  MediaDeleteBody: {
    type: "object",
    required: ["publicId"],
    properties: {
      publicId: { type: "string" },
      resourceType: {
        type: "string",
        enum: ["image", "video", "raw"],
      },
    },
  },
};

export default {
  uploadMedia,
  destroyMedia,
  definitions,
};
