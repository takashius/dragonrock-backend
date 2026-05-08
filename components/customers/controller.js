import xlsx from 'node-xlsx';
import {
  getCustomer as _getCustomer,
  getCustomers as _getCustomers,
  addCustomer as _addCustomer,
  updateCustomer as _updateCustomer,
  deleteCustomer as _deleteCustomer,
  addAddress as _addAddress,
  updateAddress as _updateAddress,
  setAddressDefault as _setAddressDefault,
  deleteAddress as _deleteAddress,
  addManyCustomers,
  getPaginateCustomers
} from "./store.js";

export async function getCustomers(filter, page, company, simple) {
  try {
    if (!page || page < 1) {
      page = 1;
    }
    if (filter === '' || filter === undefined || !filter) {
      filter = '';
    }
    let result = null;
    let newArray = [];
    if (simple) {
      result = await _getCustomers(company, simple);
      result.message.map((item) => {
        newArray.push({
          id: item._id,
          title: item.title
        })
      });
    } else {
      result = await getPaginateCustomers(filter, page, company);
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

export async function getCustomer(id, company) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Customer ID is required",
      };
    }
    const result = await _getCustomer(id, company);
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

export async function addCustomer(customer, user, company) {
  try {
    const fullCustomer = await _addCustomer(customer, user, company);
    return fullCustomer;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateCustomer(customer, company) {
  try {
    if (!customer.id) {
      return {
        status: 400,
        message: "No customer ID recived",
      };
    }
    const result = await _updateCustomer(customer, company);
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

export async function deleteCustomer(id, company) {
  try {
    const result = await _deleteCustomer(id, company);
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

export async function addAddress(customer, company) {
  try {
    const fullCustomer = await _addAddress(customer, company);
    return fullCustomer;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateAddress(address, company) {
  try {
    const fullCustomer = await _updateAddress(address, company);
    return fullCustomer;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function setAddressDefault(address, company) {
  try {
    const fullCustomer = await _setAddressDefault(address, company);
    return fullCustomer;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function deleteAddress(address, company) {
  try {
    const fullCustomer = await _deleteAddress(address, company);
    return fullCustomer;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function importCustomers(user, company) {
  const workSheetsFromFile = xlsx.parse(`./static/files/customers.xls`);
  const documentRows = workSheetsFromFile[0];
  const head = documentRows.data[0];
  let dataFormatted = [];

  let errorFormat = false;
  if (head.length !== 10) {
    errorFormat = true;
  }
  if (
    head[0] !== 'TITULO' ||
    head[1] !== 'NOMBRE' ||
    head[2] !== 'APELLIDO' ||
    head[3] !== 'RIF' ||
    head[4] !== 'CORREO' ||
    head[5] !== 'TELEFONO' ||
    head[6] !== 'CIUDAD' ||
    head[7] !== 'ZIP' ||
    head[8] !== 'DIRL1' ||
    head[9] !== 'DIRL2') {
    errorFormat = true;
  }

  if (errorFormat) {
    return {
      status: 400,
      message: "Incorrect document header, it should be TITULO, NOMBRE, APELLIDO, RIF, CORREO, TELEFONO, CIUDAD, ZIP, DIRL1, DIRL2"
    };
  }

  documentRows.data.map((item, i) => {
    if (i > 0) {
      if (item[0] !== '' && item[0] !== undefined) {
        const customer = {
          title: item[0],
          name: item[1],
          lastname: item[2],
          rif: item[3],
          email: item[4],
          phone: item[5],
          company,
          addresses: [
            {
              title: 'Default',
              city: item[6],
              line1: item[8],
              line2: item[9],
              zip: item[7],
              default: true,
            },
          ],
          created: {
            user,
          }
        }
        dataFormatted.push(customer);
      }
    }
  })

  console.log(JSON.stringify(dataFormatted, null, 2));
  const result = await addManyCustomers(dataFormatted);

  return result;
}