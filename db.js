import { set, connect as _connect } from "mongoose";
import config from "./config.js";
set("debug", config.monDebug);

async function connect(url) {
  await _connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
    .then(() => console.log("[db] Conectada con exito", url))
    .catch((err) => {
      console.log(`DB Connection Error: ${err.message}`);
    });
}

export default connect;
