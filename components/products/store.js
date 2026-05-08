import Product from "./model.js";

export async function getProduct(id, company) {
  try {
    let query = { active: true };
    if (id) {
      query = { _id: id, company: company };
    }

    const result = await Product.findOne(query).populate({
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getProduct", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getSimpleProducts(companyId) {
  try {
    let query = { active: true, company: companyId };
    let select = "id name description price iva";

    const result = await Product.find(query)
      .select(select)
      .sort({ "name": 'asc' });

    return {
      status: 200,
      message: result
    };
  } catch (e) {
    console.log("[ERROR] -> getCompanys", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getPaginateProducts(filter, page, companyId, simple) {
  try {
    const limit = 20;
    let query = { active: true, company: companyId };
    let select = "";
    if (filter) {
      query.name = { "$regex": filter, "$options": "i" }
    }

    if (simple) {
      select = "id name";
    } else {
      select = "id name description price iva active";
    }

    const result = await Product.find(query)
      .select(select)
      .populate({
        path: "created.user",
        select: ["name", "lastname"],
        model: "User",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({
        "created.date": 'desc'
      });
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const next = () => {
      if (totalPages > page) {
        return parseInt(page) + 1;
      } else {
        return null;
      }
    }

    return {
      status: 200,
      message: {
        results: result,
        totalProducts,
        totalPages,
        currentPage: page,
        next: next(),
      }
    };
  } catch (e) {
    console.log("[ERROR] -> getCompanys", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function addManyProducts(data) {
  try {
    Product.insertMany(data);
    return {
      status: 201,
      message: "Successfully added",
    };
  } catch (e) {
    console.log("[ERROR] -> addManyProducts", e);
    return {
      status: 400,
      message: "An error occurred while creating the product",
      detail: e,
    };
  }
}

export async function addProduct(data, user, company) {
  try {
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      iva: data.iva,
      company,
      created: {
        user,
      },
    };

    const product = new Product(productData);
    const result = await product.save();
    return {
      status: 201,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> addProduct", e);
    return {
      status: 400,
      message: "An error occurred while creating the product",
      detail: e,
    };
  }
}

export async function updateProduct(data, company) {
  try {
    const foundProduct = await Product.findOne({
      _id: data.id,
      company,
    });
    if (data.name) {
      foundProduct.name = data.name;
    }
    if (data.description) {
      foundProduct.description = data.description;
    }
    if (data.price) {
      foundProduct.price = data.price;
    }
    if (typeof data.iva !== 'undefined') {
      foundProduct.iva = data.iva;
    }

    await foundProduct.save();
    return {
      status: 200,
      message: "Product updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> updateProduct", e);
    return {
      status: 400,
      message: "An error occurred while updating the product",
      detail: e,
    };
  }
}

export async function deleteProduct(id, company) {
  try {
    const foundProduct = await Product.findOne({
      _id: id,
      company,
    });
    foundProduct.active = false;
    foundProduct.save();

    return { status: 200, message: "Product deleted" };
  } catch (e) {
    console.log("[ERROR] -> deleteProduct", e);
    return {
      status: 400,
      message: "An error occurred while deleting the product",
      detail: e,
    };
  }
}
