import Mailjet from "node-mailjet";
import mails from "./mails/index.js";
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "your-api-key",
  apiSecret: process.env.MJ_APIKEY_PRIVATE || "your-api-secret",
});
export async function mailer(
  config,
  correo,
  nombre,
  asunto,
  titulo,
  mensaje,
  type = 1,
  cotiza = null
) {
  let body = "";
  switch (type) {
    case 1:
      body = mails.MailCotiza(titulo, mensaje, config, nombre, cotiza);
      break;
    case 2:
      body = mails.MailDefault(titulo, mensaje);
      break;
  }

  await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "envios@erdesarrollo.com.ve",
          Name: "Cotizador",
        },
        To: [
          {
            Email: correo,
            Name: nombre,
          },
        ],
        Subject: asunto,
        TextPart: mensaje,
        HTMLPart: body,
        CustomID: "c41.Su-J3-41-M4",
      },
    ],
  });
}
