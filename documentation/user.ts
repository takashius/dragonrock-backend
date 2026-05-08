const account = {
  get: {
    tags: ["Users"],
    summary: "Get user profile",
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
          $ref: "#/definitions/ResponseUserData",
        },
      },
    },
  },
};

const login = {
  post: {
    tags: ["Users"],
    summary: "Login user with user and password",
    parameters: [
      {
        name: "email",
        in: "body",
        description: "User email to enter",
        required: true,
        schema: { type: "string", format: "email" },
      },
      {
        name: "password",
        in: "body",
        description: "User password to enter",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ResponseUserLoginData",
        },
      },
    },
  },
};

const logout = {
  post: {
    tags: ["Users"],
    summary: "User logout",
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

const create = {
  post: {
    tags: ["Users"],
    summary: "Create User",
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
        description: "User name",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "lastname",
        in: "body",
        description: "User lastname",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "phone",
        in: "body",
        description: "User phone number",
        required: false,
        schema: { type: "string" },
      },
      {
        name: "email",
        in: "body",
        description: "User email",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "password",
        in: "body",
        description: "User password to enter",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ResponseUserLoginData",
        },
      },
    },
  },
};

const update = {
  patch: {
    tags: ["Users"],
    summary: "Update User",
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
        description: "User ID",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      {
        name: "name",
        in: "body",
        description: "User name",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "lastname",
        in: "body",
        description: "User lastname",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "phone",
        in: "body",
        description: "User phone number",
        required: false,
        schema: { type: "string" },
      },
      {
        name: "email",
        in: "body",
        description: "User email",
        required: true,
        schema: { type: "string", format: "email" },
      },
      {
        name: "password",
        in: "body",
        description: "User password to enter",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ResponseUserData",
        },
      },
    },
  },
};

const list = {
  get: {
    tags: ["Users"],
    summary: "User list",
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
          $ref: "#/definitions/Users",
        },
      },
    },
  },
};

const userByID = {
  get: {
    tags: ["Users"],
    summary: "User by ID",
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
          $ref: "#/definitions/ResponseUserData",
        },
      },
    },
  },
};

const changePassword = {
  post: {
    tags: ["Users"],
    summary: "Change password to logged in user",
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
        name: "email",
        in: "body",
        description: "User email",
        required: true,
        schema: { type: "string", format: "email" },
      },
      {
        name: "password",
        in: "body",
        description: "User password",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          type: "string",
          format: "Password changed successfully",
        },
      },
    },
  },
};
const addCompany = {
  post: {
    tags: ["Users"],
    summary: "Add company to user",
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
        name: "user",
        in: "body",
        description: "Id user",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "company",
        in: "body",
        description: "Id company from user",
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
const selectCompany = {
  patch: {
    tags: ["Users"],
    summary: "Select company to user default",
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
        name: "user",
        in: "body",
        description: "Id user",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "company",
        in: "body",
        description: "Id company from user",
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
const removeCompany = {
  delete: {
    tags: ["Users"],
    summary: "Remove company from user",
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
        name: "user",
        in: "body",
        description: "Id user",
        required: true,
        schema: { ttype: "string", format: "uuid" },
      },
      {
        name: "company",
        in: "body",
        description: "Id company from user",
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
  User: {
    required: ["id", "email", "name", "email", "lastname"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        uniqueItems: true,
      },
      email: {
        type: "string",
        format: "email",
      },
      name: {
        type: "string",
      },
      lastname: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  },
  Users: {
    type: "array",
    $ref: "#/definitions/User",
  },
  ResponseUserData: {
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      lastname: { type: "string" },
      email: { type: "string", format: "email" },
      date: { type: "string", format: "date" },
    },
  },
  MiniDataUser: {
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
    },
  },
  CreatedUser: {
    properties: {
      user: { $ref: "#/definitions/MiniDataUser" },
      date: { type: "string", format: "date" },
    },
  },
  ResponseUserLoginData: {
    properties: {
      _id: { type: "string", format: "uuid" },
      name: { type: "string" },
      lastname: { type: "string" },
      email: { type: "string", format: "email" },
      date: { type: "string", format: "date" },
      token: { type: "string" },
    },
  },
};

export default {
  account,
  login,
  logout,
  create,
  update,
  list,
  userByID,
  changePassword,
  addCompany,
  selectCompany,
  removeCompany,
  definitions,
};
