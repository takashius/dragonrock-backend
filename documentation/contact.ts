const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const submitPublicContact = {
  post: {
    tags: ["Contact", "Public"],
    summary: "Formulario de contacto público",
    description:
      "Sin autenticación. Envía un correo al email de la empresa por defecto (`COMPANY_DEFAULT`) con Reply-To al remitente.",
    parameters: [
      {
        in: "body",
        name: "body",
        required: true,
        schema: { $ref: "#/definitions/SubmitPublicContactBody" },
      },
    ],
    responses: {
      200: { description: "Mensaje enviado correctamente" },
      400: validation400,
      429: { description: "Demasiadas peticiones" },
      500: { description: "Error inesperado o Mailjet no configurado" },
    },
  },
};

const definitions = {
  SubmitPublicContactBody: {
    type: "object",
    required: ["name", "email", "subject", "message"],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      subject: { type: "string" },
      message: { type: "string" },
    },
  },
};

export default {
  submitPublicContact,
  definitions,
};
