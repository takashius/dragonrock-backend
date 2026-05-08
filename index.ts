import express, { static as expressStatic } from "express";
import bodyParser from "body-parser";
import path from "path";
import db from "./db.js";
import config from "./config.js";
import router from "./network/routes.js";
import cors from "cors";
import definition from "./swagger.js";
import swaggerUi from "swagger-ui-express";

async function start(): Promise<void> {
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[db] Error de conexión:", msg);
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

  server.get("/active-response", (_req, res) => {
    res.json({ active: true });
  });

  server.use(expressStatic(config.publicRoute));
  server.use(expressStatic(path.join(process.cwd(), "static")));

  const port = Number(config.port) || 3031;
  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${port}`);
  });
}

start().catch((e: unknown) => {
  console.error("[fatal]", e);
  process.exit(1);
});
