import {
  getCotiza as _getCotiza,
  getCotizas as _getCotizas,
  addCotiza as _addCotiza,
  updateCotiza as _updateCotiza,
  deleteCotiza as _deleteCotiza,
  addProduct as _addProduct,
  updateProduct as _updateProduct,
  updateCotizaRate as _updateCotizaRate,
  deleteProduct as _deleteProduct,
} from "./store.js";
import fs from "fs";
import PDFDocument from "pdfkit";
import config from "../../config.js";
import { mailer } from "../../middelware/mailer.js";
import { getCompany } from "../company/store.js";
import {
  generateHeader,
  renderShapes,
  renderDataInvoice,
  renderDataTotal,
  renderItems,
  renderExtraPage
} from "../../middelware/utilsPDF.js";
import path from 'path';
import { textBodyEmail } from "../../middelware/utils.js";

export async function getCotizas(company) {
  try {
    const result = await _getCotizas(company);
    return result;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getCotiza(id, company) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Cotiza ID is required",
      };
    }
    const result = await _getCotiza(id, company);
    return result;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function addCotiza(cotiza, user, company) {
  try {
    const result = await _addCotiza(cotiza, user, company);
    return result;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateCotiza(cotiza, company) {
  try {
    if (!cotiza.id) {
      return {
        status: 400,
        message: "No cotiza ID recived",
      };
    }
    const result = await _updateCotiza(cotiza, company);
    return result;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateCotizaRate(cotizaId, company) {
  try {
    if (!cotizaId) {
      return {
        status: 400,
        message: "No cotiza ID recived",
      };
    }
    const result = await _updateCotizaRate(cotizaId, company);
    return result;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function deleteCotiza(id, company) {
  try {
    const result = await _deleteCotiza(id, company);
    return result;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function addProduct(cotiza, company) {
  try {
    const fullCotiza = await _addProduct(cotiza, company);
    return fullCotiza;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateProduct(cotiza, company) {
  try {
    const fullCotiza = await _updateProduct(cotiza, company);
    return fullCotiza;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function deleteProduct(cotiza, company) {
  try {
    const fullCotiza = await _deleteProduct(cotiza, company);
    return fullCotiza;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function getPdf(id, company, res, type) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Cotiza ID is required",
      };
    }
    const result = await _getCotiza(id, company);
    const configCrud = await getCompany(company);
    const configCompany = configCrud.message;

    // Obtener el idioma configurado para el PDF (por defecto 'es')
    const pdfLanguage = configCompany.configPdf?.language || "en";
    console.log(pdfLanguage);

    let doc = new PDFDocument({ size: "A4", margin: 50 });
    const routeFile = config.staticRoute + config.filesRoute + "/";
    // const path = `invoice.pdf`;

    if (type !== "libre") {
      await generateHeader(doc, result.message.company, configCompany.configPdf, pdfLanguage);
    }

    renderShapes(doc, type, configCompany.configPdf.footer?.show ?? false);
    renderDataInvoice(
      doc,
      result.message.customer,
      result.message.date,
      result.message.number,
      configCompany.currencySymbol,
      type,
      pdfLanguage
    );
    const totals = renderItems(doc, result.message.products, configCompany.currencySymbol, result.message.rate);
    const dataTotals = {
      subtotal: totals.subtotal,
      iva: configCompany.iva,
      baseImponible: totals.base,
      tasa: result.message.rate,
      footer: configCompany.configPdf.footer,
    };
    renderDataTotal(doc, dataTotals, result.message.number, configCompany.currencySymbol, type, pdfLanguage);
    if (result.message.description != null && result.message.description.trim() != '')
      await renderExtraPage(doc, result.message.company, configCompany.configPdf, result.message.description);

    doc.end();

    // const filePath = "." + routeFile + path;
    // const filePdf = fs.createWriteStream(filePath);
    // doc.pipe(filePdf);

    // res.setHeader('Content-Disposition', 'attachment; filename="' + 'invoice' + '" ')
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Content-Type', 'application/pdf')
    // await doc.pipe(res);

    // Escribe el PDF en el directorio temporal 
    const tmpDir = '/tmp';
    const fileName = 'invoice.pdf';
    const filePath = path.join(tmpDir, fileName);
    const filePdf = fs.createWriteStream(filePath);
    doc.pipe(filePdf);

    // Espera a que el archivo PDF se haya escrito 
    await new Promise((resolve, reject) => {
      filePdf.on('finish', resolve);
      filePdf.on('error', reject);
    });

    // Lee el archivo PDF y envíalo como respuesta 
    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(fileBuffer);

    return {
      status: 200,
      message: `PDF created in route ${routeFile}${path}`,
    };
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function sendByEmail(id, company) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Cotiza ID is required",
      };
    }
    const result = await _getCotiza(id, company);
    if (result.status != 200) {
      return {
        status: 400,
        message: "La cotizacion no existe",
      };
    }
    const cotiza = result.message;
    const configCrud = await getCompany(company);
    const configCompany = configCrud.message;

    const mensaje = textBodyEmail(configCompany.configMail.textBody, configCompany, cotiza);

    await mailer(
      configCompany,
      cotiza.customer.email,
      `${cotiza.customer.name} ${cotiza.customer.lastname}`,
      "Presupuesto en " + configCompany.name,
      "¡Gracias!",
      mensaje,
      1,
      {
        number: cotiza.number,
        products: cotiza.products,
        iva: configCompany.iva,
      }
    );
    return {
      status: 200,
      message: "Email sent with the cotiza",
    };
  } catch (e) {
    console.log('sendByEmail', e.response.data);
    return {
      status: e.response.data.StatusCode,
      message: e.response.data.ErrorMessage,
      detail: e.response,
    };
  }
}