import express, { static as _static } from "express";
import bodyParser from "body-parser";
import db from "./db.js";
import config from "./config.js";
import router from "./network/routes.js";
import cors from "cors";
import definition from "./swagger.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

db(config.dbUrl);

const server = express();
server.use(bodyParser.json());
server.use(cors());

router(server);

server.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(definition, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  })
);

server.get('/active-response', (req, res) => {
  const active = true;
  res.json({ active });
});

server.use(_static(config.publicRoute));
server.use(_static("./static"));

server.listen(config.port, (err) => {
  if (err) throw err;
  console.log(`Listening on http://localhost:${config.port}`);
});

// export const handler = serverless(server);
