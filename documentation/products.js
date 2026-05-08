const create = {
  post: {
    tags: ["Product"],
    summary: "Create product",
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
        description: "Product name",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "description",
        in: "body",
        description: "Product description",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "price",
        in: "body",
        description: "Product price",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "iva",
        in: "body",
        description: "Product iva",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/CreatedProduct",
        },
      },
    },
  },
};
const update = {
  patch: {
    tags: ["Product"],
    summary: "Update product",
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
        description: "Product ID",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "name",
        in: "body",
        description: "Product name",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "description",
        in: "body",
        description: "Product description",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "price",
        in: "body",
        description: "Product price",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "iva",
        in: "body",
        description: "Product iva",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { type: "string" },
      },
    },
  },
};
const productByID = {
  get: {
    tags: ["Product"],
    summary: "Product by ID",
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
          $ref: "#/definitions/CreatedProduct",
        },
      },
    },
  },
};
const list = {
  get: {
    tags: ["Product"],
    summary: "Product list",
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
          $ref: "#/definitions/ListProducts",
        },
      },
    },
  },
};
const deleted = {
  delete: {
    tags: ["Product"],
    summary: "Delete Product",
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
  Product: {
    required: ["id", "name", "description", "price", "iva"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        uniqueItems: true,
      },
      name: {
        type: "string",
      },
      description: {
        type: "string",
      },
      price: {
        type: "string",
      },
      iva: {
        type: "string",
      },
      company: {
        type: "string",
        format: "uuid",
      },
      active: {
        type: "string",
      },
    },
  },
  CreatedProduct: {
    properties: {
      _id: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: "string" },
      price: { type: "string" },
      iva: { type: "string" },
      company: { type: "string", format: "uuid" },
      active: { type: "boolean" },
      created: { $ref: "#/definitions/CreatedUser" },
    },
  },
  ListProducts: {
    type: "array",
    $ref: "#/definitions/CreatedProduct",
  },
};

export default {
  create,
  update,
  list,
  productByID,
  deleted,
  definitions,
};
