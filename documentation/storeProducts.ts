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
  description: "ObjectId del producto (24 hex)",
  pattern: "^[a-fA-F0-9]{24}$",
};

const validation400 = {
  description: "Validación Zod u error de negocio",
  schema: { $ref: "#/definitions/ValidationError" },
};

const paginateStoreProducts = {
  get: {
    tags: ["StoreProducts"],
    summary: "Productos paginados (búsqueda y filtros)",
    parameters: [
      authHeader,
      {
        name: "search",
        in: "query",
        required: false,
        type: "string",
        description: "Busca en nombre, slug, SKU, descripción y tags",
      },
      {
        name: "filter",
        in: "query",
        required: false,
        type: "string",
        description: "Alias legacy de `search`",
      },
      {
        name: "category",
        in: "query",
        required: false,
        type: "string",
        description: "ObjectId de categoría",
      },
      {
        name: "status",
        in: "query",
        required: false,
        type: "string",
        enum: ["activo", "inactivo", "agotado"],
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

const storeProductById = {
  get: {
    tags: ["StoreProducts"],
    summary: "Detalle de producto",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: { description: "Producto" },
      400: validation400,
      401: { description: "No autorizado" },
      404: { description: "No encontrado" },
      500: { description: "Error inesperado" },
    },
  },
  delete: {
    tags: ["StoreProducts"],
    summary: "Eliminar producto (soft delete)",
    parameters: [authHeader, mongoIdPathParam],
    responses: {
      200: {
        description: "Producto eliminado",
        schema: { type: "string" },
      },
      400: validation400,
      401: { description: "No autorizado" },
      500: { description: "Error inesperado" },
    },
  },
};

const createStoreProduct = {
  post: {
    tags: ["StoreProducts"],
    summary: "Crear producto",
    description:
      "Acepta JSON o multipart/form-data. Campo `image` (principal) y `galleryImages`/`galleryImages[]` para galería (igual que multimedia). Si `stock` es 0, el estado se fuerza a `agotado`.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/StoreProductInput" },
      },
    ],
    responses: {
      200: { description: "Producto creado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir imágenes",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const updateStoreProduct = {
  patch: {
    tags: ["StoreProducts"],
    summary: "Actualizar producto",
    description:
      "Acepta JSON o multipart/form-data. Galería autoritativa con `galleryImages[]` (URLs Cloudinary + binarios), igual que multimedia.",
    parameters: [
      authHeader,
      {
        name: "body",
        in: "body",
        required: true,
        schema: { $ref: "#/definitions/StoreProductPatch" },
      },
    ],
    responses: {
      200: { description: "Actualizado" },
      400: validation400,
      401: { description: "No autorizado" },
      503: {
        description: "Cloudinary no configurado cuando se intenta subir imágenes",
      },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  StoreProductInput: {
    type: "object",
    required: ["name", "slug", "category", "status", "price", "stock", "image"],
    properties: {
      name: { type: "string" },
      slug: { type: "string" },
      category: {
        type: "string",
        description: "ObjectId de la categoría",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      status: {
        type: "string",
        enum: ["activo", "inactivo", "agotado"],
      },
      price: { type: "number", minimum: 0 },
      compareAtPrice: { type: "number", minimum: 0 },
      stock: { type: "integer", minimum: 0 },
      sku: { type: "string" },
      description: { type: "string" },
      image: {
        type: "string",
        description: "Imagen principal: data URI, URL o multipart `image`",
      },
      galleryImages: {
        type: "array",
        items: { type: "string" },
      },
      isFeatured: { type: "boolean" },
      tags: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  StoreProductPatch: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-fA-F0-9]{24}$",
      },
      name: { type: "string" },
      slug: { type: "string" },
      category: { type: "string" },
      status: {
        type: "string",
        enum: ["activo", "inactivo", "agotado"],
      },
      price: { type: "number" },
      compareAtPrice: { type: "number" },
      clearCompareAtPrice: { type: "boolean" },
      stock: { type: "integer" },
      sku: { type: "string" },
      description: { type: "string" },
      image: { type: "string" },
      galleryImages: {
        type: "array",
        items: { type: "string" },
      },
      existingGallery: {
        type: "array",
        items: { type: "string" },
      },
      isFeatured: { type: "boolean" },
      tags: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
};

export default {
  paginateStoreProducts,
  storeProductById,
  createStoreProduct,
  updateStoreProduct,
  definitions,
};
