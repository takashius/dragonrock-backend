const create = {
  post: {
    tags: ["Customer"],
    summary: "Create customer",
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
        description: "Title of customer",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "name",
        in: "body",
        description: "Name of responsible",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "lastname",
        in: "body",
        description: "Lastname of responsible",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "rif",
        in: "body",
        description: "The identification number",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "email",
        in: "body",
        description: "Customer email",
        required: true,
        schema: { type: "string", format: "email" },
      },
      {
        name: "phone",
        in: "body",
        description: "Customer phone",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "address",
        in: "body",
        description: "Address customer default",
        required: true,
        schema: { $ref: "#/definitions/Addresses" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/CreatedCustomer",
        },
      },
    },
  },
};
const update = {
  patch: {
    tags: ["Customer"],
    summary: "Update customer",
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
        description: "Title of customer",
        schema: { type: "string" },
      },
      {
        name: "name",
        in: "body",
        description: "Name of responsible",
        schema: { type: "string" },
      },
      {
        name: "lastname",
        in: "body",
        description: "Lastname of responsible",
        schema: { type: "string" },
      },
      {
        name: "rif",
        in: "body",
        description: "The identification number",
        schema: { type: "number" },
      },
      {
        name: "email",
        in: "body",
        description: "Customer email",
        schema: { type: "string", format: "email" },
      },
      {
        name: "phone",
        in: "body",
        description: "Customer phone",
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
const customerByID = {
  get: {
    tags: ["Customer"],
    summary: "Customer by ID",
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
          $ref: "#/definitions/CreatedCustomer",
        },
      },
    },
  },
};
const list = {
  get: {
    tags: ["Customer"],
    summary: "Customer list",
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
          $ref: "#/definitions/ListCustomers",
        },
      },
    },
  },
};
const deleted = {
  delete: {
    tags: ["Customer"],
    summary: "Delete Customer",
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
const addAddress = {
  post: {
    tags: ["Customer"],
    summary: "Add Address to customer",
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
        description: "Id from customer",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "title",
        in: "body",
        description: "Title of address",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "city",
        in: "body",
        description: "City of address",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "line1",
        in: "body",
        description: "Address line one",
        required: true,
        schema: { type: "number" },
      },
      {
        name: "line2",
        in: "body",
        description: "Address line two",
        schema: { type: "string" },
      },
      {
        name: "zip",
        in: "body",
        description: "Zip code",
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
const updateAddress = {
  patch: {
    tags: ["Customer"],
    summary: "Update Address customer",
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
        description: "Id from customer",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "idAddress",
        in: "body",
        description: "Id address from customer",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "title",
        in: "body",
        description: "Title of address",
        schema: { type: "string" },
      },
      {
        name: "city",
        in: "body",
        description: "City of address",
        schema: { type: "string" },
      },
      {
        name: "line1",
        in: "body",
        description: "Address line one",
        schema: { type: "number" },
      },
      {
        name: "line2",
        in: "body",
        description: "Address line two",
        schema: { type: "string" },
      },
      {
        name: "zip",
        in: "body",
        description: "Zip code",
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
const setAddressDefault = {
  patch: {
    tags: ["Customer"],
    summary: "Set address by default",
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
        description: "Id from customer",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "idAddress",
        in: "body",
        description: "Id address from customer",
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
const deleteAddress = {
  delete: {
    tags: ["Customer"],
    summary: "Set address by default",
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
        description: "Id from customer",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "idAddress",
        in: "body",
        description: "Id address from customer",
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
  Customer: {
    required: ["id", "title", "name", "lastname", "rif", "email", "phone"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        uniqueItems: true,
      },
      title: {
        type: "string",
      },
      name: {
        type: "string",
      },
      lastname: {
        type: "string",
      },
      rif: {
        type: "string",
      },
      email: {
        type: "string",
        format: "email",
      },
      phone: {
        type: "string",
      },
    },
  },
  CreatedCustomer: {
    properties: {
      _id: { type: "string", format: "uuid" },
      title: { type: "string" },
      name: { type: "string" },
      lastname: { type: "string" },
      rif: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      company: { type: "string", format: "uuid" },
      active: { type: "boolean" },
      created: { $ref: "#/definitions/CreatedUser" },
      addresses: {
        type: "array",
        $ref: "#/definitions/Addresses",
      },
    },
  },
  Addresses: {
    properties: {
      _id: { type: "string", format: "uuid" },
      title: { type: "string" },
      city: { type: "string" },
      line1: { type: "string" },
      line2: { type: "string" },
      zip: { type: "string" },
      default: { type: "boolean" },
    },
  },
  AddressBase: {
    properties: {
      title: { type: "string" },
      city: { type: "string" },
      line1: { type: "string" },
      line2: { type: "string" },
      zip: { type: "string" },
    },
  },
  ListCustomers: {
    type: "array",
    $ref: "#/definitions/CreatedCustomer",
  },
};

export default {
  create,
  update,
  list,
  customerByID,
  deleted,
  addAddress,
  updateAddress,
  setAddressDefault,
  deleteAddress,
  definitions,
};
