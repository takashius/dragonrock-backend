import xlsx from 'node-xlsx';
import {
  getProduct as _getProduct,
  getSimpleProducts,
  getPaginateProducts,
  addProduct as _addProduct,
  updateProduct as _updateProduct,
  deleteProduct as _deleteProduct,
  addManyProducts
} from "./store.js";

export async function getProducts(filter, page, company, simple) {
  try {
    if (!page || page < 1) {
      page = 1;
    }
    if (filter === '' || filter === undefined || !filter) {
      filter = null;
    }
    let newArray = [];
    let result = null;
    if (simple) {
      result = await getSimpleProducts(company);
      result.message.map((item) => {
        newArray.push({
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          iva: item.iva
        })
      });
    } else {
      result = await getPaginateProducts(filter, page, company, simple);
    }
    return {
      status: result.status,
      message: simple ? newArray : result.message
    };
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getProduct(id, company) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Product ID is required",
      };
    }
    const result = await _getProduct(id, company);
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

export async function addProduct(product, user, company) {
  try {
    const result = await _addProduct(product, user, company);
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

export async function updateProduct(product, company) {
  try {
    if (!product.id) {
      return {
        status: 400,
        message: "No product ID recived",
      };
    }
    const result = await _updateProduct(product, company);
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

export async function deleteProduct(id, company) {
  try {
    const result = await _deleteProduct(id, company);
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

export async function importProducts(user, company) {
  const workSheetsFromFile = xlsx.parse(`./static/files/products.xlsx`);
  const documentRows = workSheetsFromFile[0];
  const head = documentRows.data[0];
  let dataFormatted = [];

  let errorFormat = false;
  if (head.length !== 4) {
    errorFormat = true;
  }
  if (head[0] !== 'NOMBRE' || head[1] !== 'DESCRIPCION' || head[2] !== 'PRECIO' || head[3] !== 'IVA') {
    errorFormat = true;
  }

  if (errorFormat) {
    return {
      status: 400,
      message: "Incorrect document header, it should be NOMBRE, DESCRIPCION, PRECIO, IVA"
    };
  }

  documentRows.data.map((item, i) => {
    if (i > 0) {
      const product = {
        name: item[0],
        description: item[1],
        price: item[2],
        iva: item[3],
        company,
        created: {
          user,
        }
      }
      dataFormatted.push(product);
    }
  })
  const result = await addManyProducts(dataFormatted);

  return result;
}
