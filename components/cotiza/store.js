import Cotiza from "./model.js";
import Product from "../products/model.js";
import { incrementCorrelative, getManageCorrelatives, getCompany } from "../company/store.js";
import { dolarBcv, euroBcv } from "../../middelware/utils.js";

async function findCotiza(companyId, cotizaId = null) {
  try {
    let filter = {
      active: true,
      company: companyId,
    };
    let select =
      "_id title description status number amount date created rate discount typeDiscount company customer sequence";
    const selectDetail = select + " products";
    const populateCreated = {
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    };
    const populateCompany = {
      path: "company",
      select: ["name", "email", "phone", "rif", "address", "logo", "logoAlpha"],
      model: "Company",
    };
    const populateCustomer = {
      path: "customer",
      select: [
        "title",
        "name",
        "lastname",
        "email",
        "phone",
        "rif",
        "addresses",
      ],
      model: "Customer",
    };
    let response = null;

    if (cotizaId !== null) {
      filter._id = cotizaId;
      response = await Cotiza.findOne(filter)
        .select(selectDetail)
        .populate(populateCreated)
        .populate(populateCompany)
        .populate(populateCustomer);

      response.customer.addresses = response.customer.addresses.filter(
        (item) => item.default
      );
    } else {
      response = await Cotiza.find(filter)
        .select(select)
        .populate({
          path: "customer",
          select: ["name", "lastname"],
          model: "Customer",
        })
        .sort({
          "created.date": 'desc'
        });
    }
    return response;
  } catch (e) {
    console.log("findCotiza error", e);
  }
}

export async function getCotiza(id, company) {
  try {
    const result = await findCotiza(company, id);

    const configCrud = await getCompany(company);
    const configCompany = configCrud.message;
    let base = 0;
    let subtotal = 0;

    result.products.map((item) => {
      let price = item.price;
      const subtotalPrice = price * item.amount;
      subtotal += subtotalPrice;
      if (item.iva) {
        base += subtotalPrice;
      }
    });

    const totalIva = (configCompany.iva / 100) * base;
    const total = subtotal + totalIva;

    const newResult = {
      ...result._doc,
      totalIva: totalIva,
      total: total,
    };

    return {
      status: 200,
      message: newResult,
    };
  } catch (e) {
    console.log("[ERROR] -> getCotiza", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getCotizas(companyId) {
  try {
    const result = await findCotiza(companyId);
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getCotizas", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function addCotiza(data, user, companyId) {
  try {
    const configCrud = await getCompany(companyId);
    const configCompany = configCrud.message;
    let rate = 0;

    if (!configCompany.currencyRate || configCompany.currencyRate == '$') {
      rate = await dolarBcv();
    } else if (configCompany.currencyRate == '€') {
      rate = await euroBcv();
    }
    const cotizaData = {
      title: data.title,
      description: data.description,
      number: data.number,
      date: data.date ? data.date : new Date().toLocaleDateString('en-GB'),
      rate,
      discount: data.discount ? data.discount : 0,
      typeDiscount: data.typeDiscount ? data.typeDiscount : "percentage",
      customer: data.customer,
      company: companyId,
      created: {
        user,
      },
    };

    const cotiza = new Cotiza(cotizaData);
    const sequence = await incrementCorrelative(companyId);
    cotiza.sequence = sequence;
    if (getManageCorrelatives(companyId)) {
      cotiza.number = sequence;
    }
    const result = await cotiza.save();
    return {
      status: 201,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> addCotiza", e);
    return {
      status: 400,
      message: "An error occurred while creating the product",
      detail: e,
    };
  }
}

export async function updateCotiza(data, company) {
  try {
    const foundCotiza = await Cotiza.findOne({
      _id: data.id,
      company,
    });
    if (data.title) foundCotiza.title = data.title;
    if (data.description) foundCotiza.description = data.description;
    if (data.number) foundCotiza.number = data.number;
    if (data.date) foundCotiza.date = data.date;
    if (data.discount) foundCotiza.discount = data.discount;
    if (data.typeDiscount) foundCotiza.typeDiscount = data.typeDiscount;
    if (data.customer) foundCotiza.customer = data.customer;
    if (data.rate) foundCotiza.rate = data.rate;

    let total = 0;
    foundCotiza.products.map((item) => {
      total += item.price * item.amount;
    });
    foundCotiza.amount = total;

    await foundCotiza.save();
    return {
      status: 200,
      message: "Cotizacion updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> updateCotiza", e);
    return {
      status: 400,
      message: "An error occurred while updating the cotiza",
      detail: e,
    };
  }
}

export async function updateCotizaRate(cotizaId, company) {
  try {
    const configCrud = await getCompany(company);
    const configCompany = configCrud.message;
    let rate = 0;

    if (!configCompany.currencyRate || configCompany.currencyRate == '$') {
      rate = await dolarBcv();
    } else if (configCompany.currencyRate == '€') {
      rate = await euroBcv();
    }

    const foundCotiza = await Cotiza.findOne({
      _id: cotizaId,
      company,
    });

    if (!foundCotiza) {
      return {
        status: 400,
        message: "No Cotizacion found",
      };
    }

    foundCotiza.rate = rate;

    await foundCotiza.save();
    return {
      status: 200,
      message: "Cotizacion rate updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> updateCotiza", e);
    return {
      status: 400,
      message: "An error occurred while updating the cotiza",
      detail: e,
    };
  }
}

export async function deleteCotiza(id, company) {
  try {
    const foundCotiza = await Cotiza.findOne({
      _id: id,
      company,
    });
    foundCotiza.active = false;
    foundCotiza.save();

    return { status: 200, message: "Cotizacion deleted" };
  } catch (e) {
    console.log("[ERROR] -> deleteCotiza", e);
    return {
      status: 400,
      message: "An error occurred while deleting the cotizacion",
      detail: e,
    };
  }
}

export async function addProduct(data, company) {
  try {
    const foundCotiza = await Cotiza.findOne({
      _id: data.id,
      company,
    });

    const productFound = await Product.findOne({
      _id: data.master,
      company,
    });

    const newProduct = {
      master: data.master,
      name: productFound.name,
      description: productFound.description,
      price: data.price ? data.price : productFound.price,
      amount: data.amount ? data.amount : 1,
      iva: data.iva !== "undefined" ? data.iva : productFound.iva,
    };

    foundCotiza.products.push(newProduct);
    await foundCotiza.save();
    await updateAmount(data.id);
    return {
      status: 200,
      message: "Product addeded successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> addProduct", e);
    return {
      status: 400,
      message: "An error occurred while adding an product to the cotiza.",
      detail: e,
    };
  }
}

export async function updateProduct(data, company) {
  try {
    const response = await Cotiza.updateOne(
      {
        _id: data.id,
        company,
        "products._id": data.idProduct,
      },
      {
        $set: {
          "products.$.price": data.price,
          "products.$.amount": data.amount,
          "products.$.iva": data.iva,
        },
      }
    );
    if (!response.matchedCount) {
      return {
        status: 400,
        message: "No changes in request",
      };
    }

    await updateAmount(data.id);

    return {
      status: 200,
      message: "Product updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> updateProduct", e);
    return {
      status: 400,
      message: "An error occurred while updating an product to the cotiza.",
      detail: e,
    };
  }
}

export async function deleteProduct(data, company) {
  try {
    const response = await Cotiza.updateOne(
      {
        _id: data.idParent,
        company,
      },
      { $pull: { products: { _id: data.id } } }
    );

    if (!response.modifiedCount) {
      return {
        status: 400,
        message: "No deleted product",
      };
    }
    const total = await updateAmount(data.idParent);
    console.log('TOTAL', total)
    return {
      status: 200,
      message: { total }
    };
  } catch (e) {
    console.log("[ERROR] -> deleteProduct", e);
    return {
      status: 400,
      message: "An error occurred while updating an product to the cotiza.",
      detail: e,
    };
  }
}

async function updateAmount(id) {
  let total = 0;
  const foundCotiza = await Cotiza.findOne({ _id: id });
  foundCotiza.products.map((item) => {
    total += item.price * item.amount;
  });
  foundCotiza.amount = total;
  await foundCotiza.save();
  return total;
}
