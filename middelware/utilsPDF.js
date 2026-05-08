import axios from "axios";
import { numFormat } from "./utils.js";
import { getTranslation } from "./translations.js";

export async function generateHeader(doc, data, config, language = "es") {
  const logo = data.logo ? await fetchImage(data.logo) : null;
  const logoAlpha = data.logoAlpha ? await fetchImage(data.logoAlpha) : null;
  if (logo)
    doc.image(logo, config.logo.x, config.logo.y, { width: config.logo.width });
  if (logoAlpha)
    doc.image(logoAlpha, config.logoAlpha.x, config.logoAlpha.y, {
      width: config.logoAlpha.width,
    });

  const t = (key) => getTranslation(language, key);
  doc
    .fontSize(12)
    .font("Times-Bold")
    .text(data.name, 30, 70)
    .fontSize(8)
    .font("Times-Roman")
    .text(data.address, 30, 85)
    .fontSize(10)
    .text(`${t("rif")} ${data.rif}`, 470, 60, {
      width: 80,
      align: "right",
    })
    .font("Times-Bold")
    .fontSize(8)
    .text(data.phone, 30, 100)
    .moveDown();
}

export function renderShapes(doc, type, showLineFooter) {
  doc.lineWidth(0.5);

  if (type !== "libre") {
    doc.lineJoin("round").roundedRect(350, 50, 215, 60, 10).stroke(); // RECTANGLE INVOICE NUMBER
  }
  doc.lineJoin("round").roundedRect(30, 150, 380, 70, 10).stroke(); // RECTANGLE INFO CUSTOMER
  doc.lineJoin("round").roundedRect(420, 150, 140, 70, 10).stroke(); // RECTANGLE CUSTOMER CODE
  doc.lineJoin("round").roundedRect(30, 230, 530, 450, 10).stroke(); // RECTANGLE FOR INVOICE ITEMS

  doc.moveTo(30, 167).lineTo(410, 167).stroke(); //LINE FROM NAME COMPANY
  doc.moveTo(165, 167).lineTo(165, 184).stroke(); //VERTICAL LINE PLACE
  doc.moveTo(30, 184).lineTo(410, 184).stroke(); //LINE FROM RIF | PLACE
  doc.moveTo(30, 202).lineTo(410, 202).stroke(); //LINE FROM ADDRESS
  doc.moveTo(225, 202).lineTo(225, 220).stroke(); //VERTICAL LINE PHONE
  doc.moveTo(420, 184).lineTo(560, 184).stroke(); //LINE FROM CUSTOMER CODE
  doc.moveTo(30, 250).lineTo(560, 250).stroke(); //LINE FROM TITLES INVOICE ITEMS
  //LINES VERTICALY FROM SEPARATOR INVOICE ITEMS
  doc.moveTo(100, 230).lineTo(100, 680).stroke(); //LINE FROM AMOUNT
  doc.moveTo(400, 230).lineTo(400, 680).stroke(); //LINE FROM DESCRIPTION
  doc.moveTo(480, 230).lineTo(480, 680).stroke(); //LINE FROM UNIT PRICE
  //LINES FROM TOTALS
  doc.moveTo(480, 680).lineTo(480, 730).stroke(); //750 CON TASA CALCULADA
  doc.moveTo(560, 670).lineTo(560, 730).stroke();
  doc.moveTo(340, 700).lineTo(560, 700).stroke();
  doc.moveTo(340, 715).lineTo(560, 715).stroke();
  doc.moveTo(340, 700).lineTo(340, 715).stroke();
  doc.moveTo(480, 730).lineTo(560, 730).stroke();
  // doc.moveTo(480, 750).lineTo(560, 750).stroke();
  //LINE FOR RECEIVED
  doc.moveTo(90, 715).lineTo(230, 715).stroke();

  if (showLineFooter) {
    //LINE FOR FOOTER
    doc.moveTo(30, 765).lineTo(560, 765).stroke();
  }
}

export function renderItems(doc, data, currency, rate) {
  doc.font("Times-Roman").fontSize(9);
  let y = 255;
  let subtotal = 0;
  let base = 0;

  data.map((item) => {
    let price = item.price;
    if (currency === 'Bs') {
      price = item.price * rate;
    }
    const itemTotal = price * item.amount;
    subtotal += itemTotal;
    if (item.iva) {
      base += itemTotal;
    }
    doc
      .text(item.amount, 30, y, { width: 70, align: "center" })
      .text(item.name, 105, y)
      .text(numFormat(price), 405, y, { width: 70, align: "right" })
      .text(numFormat(itemTotal), 485, y, {
        width: 70,
        align: "right",
      });
    y += 10;
  });

  return { subtotal, base };
}

export function renderDataInvoice(doc, customer, date, number, currency, type, language = "es") {
  const address = customer.addresses[0];
  const t = (key) => getTranslation(language, key);
  
  doc
    .font("Times-Roman");
  if (type !== 'libre') {
    if (type === 'presupuesto') {
      doc.fontSize(10)
        .text(t("budget"), 360, 80)
        .text(``, 360, 95);
    } else if (number !== 0) {
      doc.fontSize(10)
        .text(`${t("invoice")} ${String(number).padStart(8, "0")}`, 360, 80)
        .text(`${t("controlNo")} 00-${String(number).padStart(8, "0")}`, 360, 95);
    }
  }
  doc.fontSize(9)
    .text(
      `${t("nameOrBusinessName")}: ${customer.name} ${customer.lastname}`,
      40,
      157
    )
    .text(`${t("rif")}: ${customer.rif}`, 40, 174)
    .text(`${t("placeAndDateOfIssue")}: ${date}`, 170, 174)
    .text(`${t("taxAddress")}: ${address.line1 ? address.line1 : ''}`, 40, 189)
    .text(`${address.line2 ? address.line2 : ''}`, 40, 208)
    .text(`${t("phone")}: ${customer.phone ? customer.phone : ''}`, 230, 208)
    .text(`${t("customerCode")}: 1`, 430, 167)
    .text(`${t("paymentMethod")}: ${t("cash")}`, 430, 202)
    .font("Times-Bold")
    .fontSize(7)
    .text(t("quantity"), 45, 238)
    .text(t("conceptOrDescription"), 190, 238)
    .text(`${t("unitPrice")} ${currency}`, 405, 238)
    .text(`${t("total")} ${currency}`, 510, 238);
}

export function renderDataTotal(doc, data, number, currency, type, language = "es") {
  const totalIva = (data.iva / 100) * data.baseImponible;
  const total = totalIva + data.subtotal;
  const totalBs = total * data.tasa;
  const t = (key) => getTranslation(language, key);
  
  doc
    .font("Times-Roman")
    .fontSize(9)
    .text(t("receivedBy"), 130, 720)
    .text(t("subtotal"), 420, 688)
    .text(numFormat(data.subtotal, currency), 485, 688, { width: 70, align: "right" })
    .text(
      `${t("vat")} ${data.iva}% ${t("vatOn")} ${numFormat(data.baseImponible, currency)}`,
      325,
      705,
      { width: 150, align: "right" }
    )
    .text(numFormat(totalIva, currency), 485, 705, { width: 70, align: "right" })
    .font("Times-Bold")
    .text(t("totalToPay"), 395, 720)
    .text(numFormat(total, currency), 485, 720, { width: 70, align: "right" })
  // .text(`TOTAL Bs SEGUN TASA ${numFormat(data.tasa, currency)}`, 305, 735, {
  //   width: 170,
  //   align: "right",
  // })
  // .text(numFormat(totalBs, currency), 485, 735, { width: 70, align: "right" });

  if (type !== "libre" && type !== 'presupuesto') {
    doc
      .font("Times-Roman")
      .text(t("receivedBy"), 130, 720)
      .text(t("invoiceWithoutAmendments"), 30, 740)
      .font("Times-Bold")
      .text(t("original"), 30, 750);

    if (data.footer?.show) {
      doc.font("Times-Roman")
        .fontSize(8)
        .text(data.footer.text, 30, 770, { width: 530, align: "center" })
    }
  }
}

export async function renderExtraPage(doc, data, config, extraData = '') {
  doc.addPage();
  const logo = data.logo ? await fetchImage(data.logo) : null;
  const logoAlpha = data.logoAlpha ? await fetchImage(data.logoAlpha) : null;
  if (logo)
    doc.image(logo, config.logo.x, config.logo.y, { width: config.logo.width });
  if (logoAlpha)
    doc.image(logoAlpha, config.logoAlpha.x, config.logoAlpha.y, {
      width: config.logoAlpha.width,
    });
  doc.lineJoin("round").roundedRect(30, 50, 550, 770, 10).stroke();
  doc.font("Times-Roman").fontSize(12);
  doc.text(extraData, 40, 60, { width: 530, align: "justify" });
}

const fetchImage = async (src) => {
  const image = await axios.get(src, {
    responseType: "arraybuffer",
  });
  return image.data;
};
