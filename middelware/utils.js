import * as cheerio from "cheerio";
import axios from "axios";
import https from "https";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const formato = (str, int = 0) => {
  const monedas = ["USD", "EUR", "CNY", "TRY", "RUB"];
  const valor = str
    .replace(/(\r\n|\n|\r)/gm, "")
    .replace(monedas[int], "")
    .trim()
    .replace(",", ".");

  const res = parseFlt(valor);
  return res;
};
const parseFlt = (str, int = 2) => {
  const res = parseFloat(str).toFixed(int);
  return res;
};

export async function dolarBcv() {
  const bcv = await axios.get("https://www.bcv.org.ve", { httpsAgent });
  const $ = cheerio.load(bcv.data);
  const dolar = formato($("#dolar").text(), 0);
  return dolar;
}

export async function euroBcv() {
  const bcv = await axios.get("https://www.bcv.org.ve", { httpsAgent });
  const $ = cheerio.load(bcv.data);
  const dolar = formato($("#euro").text(), 1);
  return dolar;
}

export function numFormat(number, currency) {
  let options = {};
  switch (currency) {
    case '$':
      options = {
        style: "currency",
        currency: "USD",
      };
      break;
    case 'Bs':
      options = {
        style: "currency",
        currency: "VED",
      };
      break;
    case '€':
      options = {
        style: "currency",
        currency: "EUR",
      };
      break;
  }
  if (options.currency === 'VED') {
    return new Intl.NumberFormat("de-DE", options).format(number).replace("VED", "Bs");
  } else {
    return new Intl.NumberFormat("de-DE", options).format(number);
  }
}

export function textBodyEmail(text, company, cotiza) {

  text = text.replace(/</g, "&60;");
  text = text.replace(/>/g, "&62;");
  text = text.replace(/{br}/g, "<br />");
  text = text.replace(/{cotizaNumber}/g, cotiza.number);
  text = text.replace(/{CompanyName}/g, company.name);
  text = text.replace(/{emailCompany}/g, `<a href="mailto:${company.email}" style="text-decoration: none; color: ${company.configMail.colors.primary}">${company.email}</a>`);

  return text;
}
