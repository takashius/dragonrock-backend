/**
 * Traducciones para los PDFs generados
 * Soporta español (es) e inglés (en)
 */

export const translations = {
  es: {
    // Encabezado
    rif: "RIF",
    
    // Tipo de documento
    budget: "PRESUPUESTO",
    invoice: "FACTURA",
    controlNo: "No. DE CONTROL",
    
    // Información del cliente
    nameOrBusinessName: "Nombre o Razón Social",
    placeAndDateOfIssue: "Lugar y Fecha de Emisión",
    taxAddress: "Dirección Fiscal",
    phone: "Teléfono",
    customerCode: "Código de Cliente",
    paymentMethod: "Forma de Pago",
    cash: "Contado",
    
    // Tabla de productos
    quantity: "CANTIDAD",
    conceptOrDescription: "CONCEPTO O DESCRIPCIÓN",
    unitPrice: "PRECIO UNITARIO",
    total: "TOTAL",
    
    // Totales
    receivedBy: "RECIBIDO POR",
    subtotal: "SUB-TOTAL",
    vat: "I.V.A.",
    vatOn: "SOBRE",
    totalToPay: "TOTAL A PAGAR",
    
    // Pie de factura
    invoiceWithoutAmendments: "ESTA FACTURA VA SIN TACHADURA NI ENMIENDAS",
    original: "ORIGINAL",
  },
  en: {
    // Encabezado
    rif: "ID",
    
    // Tipo de documento
    budget: "BUDGET",
    invoice: "INVOICE",
    controlNo: "CONTROL NO.",
    
    // Información del cliente
    nameOrBusinessName: "Name or Business Name",
    placeAndDateOfIssue: "Place and Date of Issue",
    taxAddress: "Tax Address",
    phone: "Phone",
    customerCode: "Customer Code",
    paymentMethod: "Payment Method",
    cash: "Cash",
    
    // Tabla de productos
    quantity: "QUANTITY",
    conceptOrDescription: "CONCEPT OR DESCRIPTION",
    unitPrice: "UNIT PRICE",
    total: "TOTAL",
    
    // Totales
    receivedBy: "RECEIVED BY",
    subtotal: "SUB-TOTAL",
    vat: "VAT",
    vatOn: "ON",
    totalToPay: "TOTAL TO PAY",
    
    // Pie de factura
    invoiceWithoutAmendments: "THIS INVOICE IS WITHOUT CROSS-OUTS OR AMENDMENTS",
    original: "ORIGINAL",
  },
};

/**
 * Obtiene una traducción según el idioma especificado
 * @param {string} language - Idioma ('es' o 'en')
 * @param {string} key - Clave de la traducción
 * @returns {string} Texto traducido o la clave si no se encuentra
 */
export function getTranslation(language, key) {
  const lang = language && translations[language] ? language : "es";
  return translations[lang][key] || key;
}

/**
 * Obtiene todas las traducciones para un idioma
 * @param {string} language - Idioma ('es' o 'en')
 * @returns {object} Objeto con todas las traducciones del idioma
 */
export function getTranslations(language) {
  const lang = language && translations[language] ? language : "es";
  return translations[lang];
}

