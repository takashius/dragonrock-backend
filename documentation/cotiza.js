const create = {
  post: {
    tags: ["Cotizacion"],
    summary: "Create cotiza",
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
        name: "title",
        in: "body",
        description: "Title of cotiza",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "description",
        in: "body",
        description: "Description of cotiza",
        schema: { type: "string" },
      },
      {
        name: "number",
        in: "body",
        description: "Number of bill",
        schema: { type: "number" },
      },
      {
        name: "date",
        in: "body",
        description: "Date for bill",
        schema: { type: "string" },
      },
      {
        name: "discount",
        in: "body",
        description: "Discount for Bill",
        schema: { type: "number" },
      },
      {
        name: "customer",
        in: "body",
        description: "Customer destination",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/CreatedCotiza",
        },
      },
    },
  },
};
const update = {
  patch: {
    tags: ["Cotizacion"],
    summary: "Update cotiza",
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
        name: "title",
        in: "body",
        description: "Title of cotiza",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "description",
        in: "body",
        description: "Description of cotiza",
        schema: { type: "string" },
      },
      {
        name: "number",
        in: "body",
        description: "Number of bill",
        schema: { type: "number" },
      },
      {
        name: "date",
        in: "body",
        description: "Date for bill",
        schema: { type: "string" },
      },
      {
        name: "rate",
        in: "body",
        description: "Update rate from origin",
        required: true,
        schema: { type: "number", default: 0 },
      },
      {
        name: "discount",
        in: "body",
        description: "Discount for Bill",
        schema: { type: "number" },
      },
      {
        name: "customer",
        in: "body",
        description: "Customer destination",
        schema: { type: "string", format: "uuid" },
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
const cotizaByID = {
  get: {
    tags: ["Cotizacion"],
    summary: "Cotizacion by ID",
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
          $ref: "#/definitions/CreatedCotiza",
        },
      },
    },
  },
};
const list = {
  get: {
    tags: ["Cotizacion"],
    summary: "Cotizacion list",
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
          $ref: "#/definitions/ListCotiza",
        },
      },
    },
  },
};
const deleted = {
  delete: {
    tags: ["Cotizacion"],
    summary: "Delete Cotizacion",
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
const addProduct = {
  post: {
    tags: ["Cotizacion"],
    summary: "Add Product to Cotiza",
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
        description: "Id from cotiza",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "master",
        in: "body",
        description: "Id product",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "price",
        in: "body",
        description: "Price from product",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "amount",
        in: "body",
        description: "Amount from product",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "iva",
        in: "body",
        description: "Iva from product",
        schema: { type: "number" },
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
const updateProduct = {
  patch: {
    tags: ["Cotizacion"],
    summary: "Update Product cotiza",
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
        description: "Id from cotiza",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "idProduct",
        in: "body",
        description: "Id product from cotiza",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "price",
        in: "body",
        description: "Price from product",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "amount",
        in: "body",
        description: "Amount from product",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "iva",
        in: "body",
        description: "Iva from product",
        required: true,
        schema: { type: "number" },
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
const deleteProduct = {
  delete: {
    tags: ["Cotizacion"],
    summary: "Delete product from cotiza",
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
        description: "Id from cotiza",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "idProduct",
        in: "body",
        description: "Id product from cotiza",
        required: true,
        schema: { ttype: "string", format: "uuid" },
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

const definitions = {
  Cotizacion: {
    required: ["id", "title", "date", "customer", "rate"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        uniqueItems: true,
      },
      title: {
        type: "string",
      },
      description: {
        type: "string",
      },
      number: {
        type: "string",
      },
      date: {
        type: "string",
      },
      rate: {
        type: "string",
      },
      discount: {
        type: "number",
      },
      customer: {
        type: "string",
        format: "uuid",
      },
    },
  },
  CreatedCotiza: {
    properties: {
      _id: { type: "string", format: "uuid" },
      title: { type: "string" },
      description: { type: "string" },
      number: { type: "string" },
      date: { type: "string" },
      rate: { type: "number" },
      discount: { type: "number" },
      customer: { type: "string", format: "uuid" },
      company: { type: "string", format: "uuid" },
      active: { type: "boolean" },
      created: { $ref: "#/definitions/CreatedUser" },
      products: {
        type: "array",
        $ref: "#/definitions/ProductsCotiza",
      },
    },
  },
  ProductsCotiza: {
    properties: {
      _id: { type: "string", format: "uuid" },
      master: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: "string" },
      price: { type: "number" },
      amount: { type: "number" },
      iva: { type: "boolean" },
    },
  },
  ProductsBase: {
    properties: {
      master: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: "string" },
      price: { type: "number" },
      amount: { type: "number" },
      iva: { type: "boolean" },
    },
  },
  ListCotiza: {
    type: "array",
    $ref: "#/definitions/CreatedCotiza",
  },
};

export default {
  create,
  update,
  list,
  cotizaByID,
  deleted,
  addProduct,
  updateProduct,
  deleteProduct,
  definitions,
};
