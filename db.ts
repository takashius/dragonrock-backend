import { set, connect as mongooseConnect } from "mongoose";
import config from "./config.js";

set("debug", Boolean(config.monDebug));

async function connect(url: string): Promise<void> {
  if (!url?.trim()) {
    throw new Error("BD_URL no está definida o está vacía");
  }
  await mongooseConnect(url);
  console.log("[db] Conectada correctamente");
}

export default connect;
