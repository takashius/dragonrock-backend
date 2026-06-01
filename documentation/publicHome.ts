const getPublicHome = {
  get: {
    tags: ["Public"],
    summary: "Home público",
    description:
      "Sin autenticación. Devuelve las 3 últimas noticias publicadas, 4 próximos eventos activos (no cancelados), 2 emprendedores destacados al azar y 3 productos destacados al azar.",
    responses: {
      200: {
        description: "Contenido del home",
        schema: { $ref: "#/definitions/PublicHomePayload" },
      },
      400: { description: "Error de consulta" },
      500: { description: "Error inesperado" },
    },
  },
};

const definitions = {
  PublicHomePayload: {
    type: "object",
    properties: {
      news: {
        type: "array",
        description: "Últimas 3 noticias publicadas",
        items: { type: "object" },
      },
      liveEvents: {
        type: "array",
        description: "4 próximos eventos activos (no cancelados)",
        items: { type: "object" },
      },
      featuredEntrepreneurs: {
        type: "array",
        description: "Hasta 2 emprendedores destacados aleatorios",
        items: { type: "object" },
      },
      featuredProducts: {
        type: "array",
        description: "Hasta 3 productos destacados aleatorios (activos)",
        items: { type: "object" },
      },
    },
  },
};

export default {
  getPublicHome,
  definitions,
};
