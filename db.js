import { set, connect as _connect } from "mongoose";
import config from "./config.js";
set("debug", config.monDebug);

async function connect(url) {
  if (!url?.trim()) {
    throw new Error("BD_URL no está definida o está vacía");
  }
  await _connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("[db] Conectada correctamente");
}

export default connect;
