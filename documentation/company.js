const create = {
  post: {
    tags: ["Company"],
    summary: "Create company",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: {
          type: "string",
        },
      },
      {
        name: "name",
        in: "body",
        description: "Company name",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "description",
        in: "body",
        description: "Company description",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "email",
        in: "body",
        description: "Company email",
        required: true,
        schema: { type: "string", format: "email" },
      },
      {
        name: "phone",
        in: "body",
        description: "Company phone",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "rif",
        in: "body",
        description: "Company rif",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "address",
        in: "body",
        description: "Company address",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "photo",
        in: "body",
        description: "Company logo",
        required: false,
        schema: { type: "string" },
      },
      {
        name: "configPdf",
        in: "body",
        description: "PDF configuration",
        required: false,
        schema: {
          type: "object",
          properties: {
            language: {
              type: "string",
              enum: ["es", "en"],
              default: "es",
              description: "PDF language (es: Spanish, en: English)",
            },
          },
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/CreatedCompany",
        },
      },
    },
  },
};
const update = {
  patch: {
    tags: ["Company"],
    summary: "Create company",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: {
          type: "string",
        },
      },
      {
        name: "id",
        in: "body",
        description: "Company ID",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "name",
        in: "body",
        description: "Company name",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "description",
        in: "body",
        description: "Company description",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "email",
        in: "body",
        description: "Company email",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "phone",
        in: "body",
        description: "Company phone",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "rif",
        in: "body",
        description: "Company rif",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "address",
        in: "body",
        description: "Company address",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "photo",
        in: "body",
        description: "Company logo",
        required: false,
        schema: { type: "string" },
      },
      {
        name: "configPdf",
        in: "body",
        description: "PDF configuration",
        required: false,
        schema: {
          type: "object",
          properties: {
            language: {
              type: "string",
              enum: ["es", "en"],
              default: "es",
              description: "PDF language (es: Spanish, en: English)",
            },
          },
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/CreatedCompany",
        },
      },
    },
  },
};
const companyByID = {
  get: {
    tags: ["Company"],
    summary: "Company by ID",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: {
          type: "string",
        },
      },
      {
        name: "id",
        in: "path",
        description: "id to search",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/CreatedCompany",
        },
      },
    },
  },
};
const list = {
  get: {
    tags: ["Company"],
    summary: "Company list",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ListCompany",
        },
      },
    },
  },
};
const deleted = {
  delete: {
    tags: ["Company"],
    summary: "Delete Company",
    parameters: [
      {
        name: "Authorization",
        in: "header",
        description: "Authorization Bearer Token",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          type: "string",
        },
      },
    },
  },
};

const definitions = {
  Company: {
    required: ["id", "email", "name", "description", "phone", "rif", "address"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        uniqueItems: true,
      },
      name: {
        type: "string",
      },
      email: {
        type: "string",
        format: "email",
      },
      description: {
        type: "string",
      },
      phone: {
        type: "string",
      },
      rif: {
        type: "string",
      },
      address: {
        type: "string",
      },
      photo: {
        type: "string",
      },
      active: {
        type: "string",
      },
    },
  },
  CreatedCompany: {
    properties: {
      _id: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      rif: { type: "string" },
      address: { type: "string" },
      active: { type: "boolean" },
      date: { type: "string", format: "date" },
      created: { $ref: "#/definitions/CreatedUser" },
      configPdf: {
        type: "object",
        properties: {
          language: {
            type: "string",
            enum: ["es", "en"],
            default: "es",
            description: "PDF language (es: Spanish, en: English)",
          },
        },
      },
    },
  },
  ListCompany: {
    type: "array",
    $ref: "#/definitions/CreatedCompany",
  },
};

export default {
  create,
  update,
  list,
  companyByID,
  deleted,
  definitions,
};
