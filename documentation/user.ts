/** Bearer JWT (usuario autenticado; empresa activa en el token). */
const authBearerHeader = {
  name: "Authorization",
  in: "header",
  description: "Bearer JWT del usuario (empresa activa en el token)",
  required: true,
  type: "string",
};

/** `_id` de documento MongoDB en rutas. */
const mongoIdPathParam = {
  name: "id",
  in: "path",
  description: "ObjectId de MongoDB (24 caracteres hexadecimales)",
  required: true,
  type: "string",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description:
    "Validación fallida (Zod) o error de negocio; cuerpo JSON con `error` y `issues` si aplica validación",
  schema: {
    $ref: "#/definitions/ValidationError",
  },
};

const account = {
  get: {
    tags: ["Users"],
    summary: "Get user profile",
    parameters: [authBearerHeader],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ResponseUserData",
        },
      },
      401: { description: "Token inválido o ausente" },
    },
  },
};

const login = {
  post: {
    tags: ["Users"],
    summary: "Iniciar sesión",
    parameters: [
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/LoginBody" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ResponseUserLoginData",
        },
      },
      400: validation400,
      429: {
        description: "Demasiados intentos de login desde esta IP (rate limit)",
      },
    },
  },
};

const logout = {
  post: {
    tags: ["Users"],
    summary: "Cerrar sesión (token actual)",
    parameters: [authBearerHeader],
    responses: {
      200: {
        description: "OK",
        schema: {
          type: "string",
        },
      },
      400: { description: "Datos de usuario inválidos" },
      401: { description: "No autorizado" },
    },
  },
};

const create = {
  post: {
    tags: ["Users"],
    summary: "Crear usuario (autenticado)",
    parameters: [
      authBearerHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/UserCreateBody" },
      },
    ],
    responses: {
      201: {
        description: "Usuario creado",
        schema: {
          $ref: "#/definitions/ResponseUserLoginData",
        },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error al registrar usuario" },
    },
  },
};

const update = {
  patch: {
    tags: ["Users"],
    summary: "Actualizar usuario (campos opcionales salvo id)",
    parameters: [
      authBearerHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/UserUpdateBody" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ResponseUserData",
        },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const list = {
  get: {
    tags: ["Users"],
    summary: "Listar usuarios",
    parameters: [authBearerHeader],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/Users",
        },
      },
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const userByID = {
  get: {
    tags: ["Users"],
    summary: "Obtener usuario por id",
    parameters: [authBearerHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "OK",
        schema: {
          $ref: "#/definitions/ResponseUserData",
        },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["Users"],
    summary: "Eliminar usuario por id",
    parameters: [authBearerHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Usuario eliminado (mensaje texto)",
        schema: { type: "string" },
      },
      400: { description: "Usuario no encontrado u error" },
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const changePassword = {
  post: {
    tags: ["Users"],
    summary: "Cambiar contraseña del usuario autenticado",
    parameters: [
      authBearerHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/ChangePasswordBody" },
      },
    ],
    responses: {
      200: {
        description: "Contraseña actualizada",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};
const addCompany = {
  post: {
    tags: ["Users"],
    summary: "Asociar empresa a usuario",
    parameters: [
      authBearerHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/AddCompanyBody" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};
const selectCompany = {
  patch: {
    tags: ["Users"],
    summary: "Seleccionar empresa por defecto",
    parameters: [
      authBearerHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/CompanyIdBody" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};
const removeCompany = {
  delete: {
    tags: ["Users"],
    summary: "Desvincular empresa del usuario autenticado",
    parameters: [
      authBearerHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/CompanyIdBody" },
      },
    ],
    responses: {
      200: {
        description: "OK",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const recoveryRequestCode = {
  get: {
    tags: ["Users"],
    summary:
      "[Deprecado] Solicitar código por email vía path — puede facilitar enumeración de cuentas. Preferir POST /user/recovery/request.",
    parameters: [
      {
        name: "email",
        in: "path",
        description: "Correo del usuario (URL-encoded si hace falta)",
        required: true,
        type: "string",
        format: "email",
      },
    ],
    responses: {
      200: { description: "Código enviado por correo" },
      400: validation400,
      429: { description: "Demasiadas solicitudes (rate limit)" },
      500: { description: "Error de red o servidor" },
    },
  },
};

const recoveryRequestPost = {
  post: {
    tags: ["Users"],
    summary:
      "Solicitar código de recuperación (recomendado; cuerpo JSON con email)",
    parameters: [
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/RecoveryRequestBody" },
      },
    ],
    responses: {
      200: { description: "Código enviado por correo" },
      400: validation400,
      429: { description: "Demasiadas solicitudes (rate limit)" },
      500: { description: "Error de red o servidor" },
    },
  },
};

const recoveryApplyCode = {
  post: {
    tags: ["Users"],
    summary: "Confirmar código y establecer nueva contraseña",
    parameters: [
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/RecoveryStepTwoBody" },
      },
    ],
    responses: {
      200: { description: "Contraseña actualizada" },
      400: validation400,
      429: { description: "Demasiadas solicitudes (rate limit)" },
      500: { description: "Error inesperado" },
    },
  },
};

const registerPublic = {
  post: {
    tags: ["Users"],
    summary: "Registro público de usuario y empresa",
    parameters: [
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/RegisterPublicBody" },
      },
    ],
    responses: {
      201: { description: "Usuario y empresa creados" },
      400: validation400,
      429: { description: "Demasiadas solicitudes (rate limit)" },
      500: { description: "Error al registrar" },
    },
  },
};

const logoutAll = {
  post: {
    tags: ["Users"],
    summary: "Cerrar sesión en todos los dispositivos",
    parameters: [authBearerHeader],
    responses: {
      200: {
        description: "OK",
        schema: {
          type: "string",
        },
      },
      400: { description: "Datos de usuario inválidos" },
      401: { description: "No autorizado" },
    },
  },
};

const definitions = {
  ValidationError: {
    type: "object",
    description: "Respuesta típica de validación Zod (400)",
    properties: {
      error: { type: "string", example: "Validación" },
      issues: {
        type: "object",
        description: "Mapa de campos a errores (formato Zod `.format()`)",
      },
    },
  },
  LoginBody: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", description: "Contraseña en texto plano (HTTPS)" },
    },
  },
  UserCreateBody: {
    type: "object",
    required: ["name", "lastname", "email", "password"],
    properties: {
      name: { type: "string", minLength: 1 },
      lastname: { type: "string", minLength: 1 },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8, description: "Mínimo 8 caracteres" },
      role: { type: "string", enum: ["Administrador", "Editor", "Autor"] },
      phone: { type: "string" },
      photo: {
        type: "string",
        description:
          "Imagen de perfil de entrada (data URI o URL remota). Se sube a Cloudinary y se guarda la URL final.",
      },
    },
    description:
      "Campos adicionales permitidos (p. ej. datos Mongoose) se documentan como passthrough en el servidor.",
  },
  UserUpdateBody: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
        description: "ObjectId del usuario a modificar",
      },
      name: { type: "string" },
      lastname: { type: "string" },
      role: { type: "string", enum: ["Administrador", "Editor", "Autor"] },
      photo: {
        type: "string",
        description:
          "Nueva imagen de perfil (data URI o URL remota). Reemplaza la anterior en Cloudinary.",
      },
      phone: { type: "string" },
      password: { type: "string", minLength: 8 },
    },
    description: "Solo `id` es obligatorio; el resto de campos son opcionales.",
  },
  ChangePasswordBody: {
    type: "object",
    required: ["password"],
    properties: {
      password: {
        type: "string",
        minLength: 8,
        description: "Nueva contraseña (mínimo 8 caracteres)",
      },
    },
  },
  CompanyIdBody: {
    type: "object",
    required: ["company"],
    properties: {
      company: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
        description: "ObjectId de la empresa",
      },
    },
  },
  AddCompanyBody: {
    type: "object",
    required: ["user", "company"],
    properties: {
      user: { type: "string", pattern: "^[a-fA-F0-9]{24}$", description: "ObjectId usuario" },
      company: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
        description: "ObjectId empresa a asociar",
      },
    },
  },
  RecoveryRequestBody: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
    },
  },
  RecoveryStepTwoBody: {
    type: "object",
    required: ["email", "code", "newPass"],
    properties: {
      email: { type: "string", format: "email" },
      code: { type: "string", minLength: 4, maxLength: 32, description: "Código recibido por correo" },
      newPass: { type: "string", minLength: 8, maxLength: 500, description: "Nueva contraseña" },
    },
  },
  RegisterPublicBody: {
    type: "object",
    required: ["name", "email", "password", "companyName", "docId"],
    properties: {
      name: { type: "string", maxLength: 200 },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8, maxLength: 500 },
      companyName: { type: "string", maxLength: 200 },
      docId: { type: "string", maxLength: 100, description: "RIF u otro documento de empresa" },
      phone: { type: "string", maxLength: 50 },
    },
  },
  User: {
    required: ["id", "email", "name", "lastname"],
    properties: {
      id: {
        type: "string",
        description: "ObjectId MongoDB",
        pattern: "^[a-fA-F0-9]{24}$",
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
      role: {
        type: "string",
        enum: ["Administrador", "Editor", "Autor"],
      },
      phone: {
        type: "string",
      },
      password: {
        type: "string",
      },
      photo: {
        type: "string",
        description: "URL final de la foto de perfil almacenada en Cloudinary",
      },
    },
  },
  Users: {
    type: "array",
    items: {
      $ref: "#/definitions/User",
    },
  },
  ResponseUserData: {
    properties: {
      id: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
      name: { type: "string" },
      lastname: { type: "string" },
      role: { type: "string", enum: ["Administrador", "Editor", "Autor"] },
      phone: { type: "string" },
      photo: { type: "string" },
      email: { type: "string", format: "email" },
      date: { type: "string", format: "date" },
    },
  },
  MiniDataUser: {
    properties: {
      id: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
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
      _id: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
      name: { type: "string" },
      lastname: { type: "string" },
      role: { type: "string", enum: ["Administrador", "Editor", "Autor"] },
      phone: { type: "string" },
      photo: { type: "string" },
      email: { type: "string", format: "email" },
      date: { type: "string", format: "date" },
      token: { type: "string" },
      company: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    },
  },
};

export default {
  account,
  login,
  logout,
  logoutAll,
  create,
  update,
  list,
  userByID,
  changePassword,
  addCompany,
  selectCompany,
  removeCompany,
  recoveryRequestCode,
  recoveryRequestPost,
  recoveryApplyCode,
  registerPublic,
  definitions,
};
