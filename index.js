import express, { static as _static } from "express";
import bodyParser from "body-parser";
import db from "./db.js";
import config from "./config.js";
import router from "./network/routes.js";
import cors from "cors";
import definition from "./swagger.js";
import swaggerUi from "swagger-ui-express";
async function start() {
  if (!config.JWT_KEY?.trim()) {
    console.error(
      "[fatal] JWT_KEY es obligatorio. Definelo en .env o variables de entorno."
    );
    process.exit(1);
  }
  if (!config.dbUrl?.trim()) {
    console.error("[fatal] BD_URL es obligatorio.");
    process.exit(1);
  }

  try {
    await db(config.dbUrl);
  } catch (err) {
    console.error("[db] Error de conexión:", err.message || err);
    process.exit(1);
  }

  const server = express();
  server.use(bodyParser.json());
  // TODO(producción): restringir CORS (origin explícitos, métodos permitidos).
  server.use(cors());

  router(server);

  server.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(definition, {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    })
  );

  server.get("/active-response", (req, res) => {
    const active = true;
    res.json({ active });
  });

  server.use(_static(config.publicRoute));
  server.use(_static("./static"));

  server.listen(config.port, (err) => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${config.port}`);
  });
}

start().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});

// export const handler = serverless(server);
