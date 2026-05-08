import Customer from "./model.js";

async function findCustomer({ companyId = null, customerId = null, simple = null }) {
  try {
    let select = "";
    let filter = {
      active: true,
    };
    if (companyId) {
      filter.company = companyId;
    }
    if (simple) {
      select = "id title";
    } else {
      select = "id title name lastname email phone rif active created company addresses";
    }
    const populateCreated = {
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    };
    let response = null;

    if (customerId !== null) {
      filter._id = customerId;
      response = await Customer.findOne(filter)
        .select(select)
        .populate(populateCreated);
    } else {
      response = await Customer.find(filter)
        .select(select)
        .populate(!simple && populateCreated)
        .sort(simple ? { "title": 'asc' } : { "created.date": 'desc' });
    }
    return response;
  } catch (e) {
    console.log("findCustomer error", e);
  }
}

export async function getCustomer(id, company) {
  try {
    const result = await findCustomer({ companyId: company, customerId: id });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getCustomer", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getCustomers(company, simple) {
  try {
    const result = await findCustomer({ companyId: company, simple });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getCustomers", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getPaginateCustomers(filter, page, companyId) {
  try {
    const limit = 20;
    let query = { active: true, company: companyId };
    let queryOr = null;
    let totalCustomers = 0;
    let result = null;
    const populate = {
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    };
    queryOr = [
      { title: { "$regex": filter, "$options": "i" } },
      { name: { "$regex": filter, "$options": "i" } },
      { lastname: { "$regex": filter, "$options": "i" } }
    ];

    const select = "id title name lastname email phone rif active created company addresses";
    if (filter) {
      result = await Customer.find(query)
        .select(select)
        .or(queryOr)
        .populate(populate)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ "created.date": 'desc' });
    } else {
      result = await Customer.find(query)
        .select(select)
        .populate(populate)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ "created.date": 'desc' });
    }
    if (filter) {
      totalCustomers = await Customer
        .countDocuments(query)
        .or(queryOr);
    } else {
      totalCustomers = await Customer
        .countDocuments(query);
    }
    const totalPages = Math.ceil(totalCustomers / limit);
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
        totalCustomers,
        totalPages,
        currentPage: page,
        next: next(),
      }
    };
  } catch (e) {
    console.log("[ERROR] -> getCustomers", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function addCustomer(data, user, company) {
  try {
    const customerData = {
      title: data.title,
      name: data.name,
      lastname: data.lastname,
      rif: data.rif,
      email: data.email,
      phone: data.phone,
      company,
      addresses: [
        {
          title: data.address.title,
          city: data.address.city,
          line1: data.address.line1,
          line2: data.address.line2,
          zip: data.address.zip,
          default: true,
        },
      ],
      created: {
        user,
      },
    };

    const customer = new Customer(customerData);
    const result = await customer.save();
    return {
      status: 201,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> addCustomer", e);
    return {
      status: 400,
      message: "An error occurred while creating the customer",
      detail: e,
    };
  }
}

export async function updateCustomer(data, company) {
  try {
    const foundCustomer = await Customer.findOne({
      _id: data.id,
      company,
    });
    if (data.title) {
      foundCustomer.title = data.title;
    }
    if (data.name) {
      foundCustomer.name = data.name;
    }
    if (data.lastname) {
      foundCustomer.lastname = data.lastname;
    }
    if (data.rif) {
      foundCustomer.rif = data.rif;
    }
    if (data.email) {
      foundCustomer.email = data.email;
    }
    if (data.phone) {
      foundCustomer.phone = data.phone;
    }

    await foundCustomer.save();
    return {
      status: 200,
      message: "Customer updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> updateCustomer", e);
    return {
      status: 400,
      message: "An error occurred while updating the customer",
      detail: e,
    };
  }
}

export async function deleteCustomer(id, company) {
  try {
    const foundCustomer = await Customer.findOne({
      _id: id,
      company,
    });
    foundCustomer.active = false;
    foundCustomer.save();

    return { status: 200, message: "Customer deleted" };
  } catch (e) {
    console.log("[ERROR] -> deleteCustomer", e);
    return {
      status: 400,
      message: "An error occurred while deleting the customer",
      detail: e,
    };
  }
}

export async function addAddress(data, company) {
  try {
    const foundCustomer = await Customer.findOne({
      _id: data.id,
      company,
    });

    const newAddress = {
      title: data.title,
      city: data.city,
      line1: data.line1,
      line2: data.line2,
      zip: data.zip,
    };

    foundCustomer.addresses.push(newAddress);
    await foundCustomer.save();
    return {
      status: 200,
      message: "Address addeded successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> addCustomer", e);
    return {
      status: 400,
      message: "An error occurred while adding an address to the client.",
      detail: e,
    };
  }
}

export async function updateAddress(data, company) {
  try {
    await Customer.updateOne(
      {
        _id: data.id,
        company,
        "addresses._id": data.idAddress,
      },
      {
        $set: {
          "addresses.$.title": data.title,
          "addresses.$.city": data.city,
          "addresses.$.line1": data.line1,
          "addresses.$.line2": data.line2,
          "addresses.$.zip": data.zip,
          "addresses.$.default": data.default,
        },
      }
    );

    return {
      status: 200,
      message: "Address updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> addCustomer", e);
    return {
      status: 400,
      message: "An error occurred while updating an address to the client.",
      detail: e,
    };
  }
}

export async function setAddressDefault(data, company) {
  try {
    await Customer.updateOne(
      {
        _id: data.id,
        company,
        "addresses.default": true,
      },
      { $set: { "addresses.$.default": false } }
    );
    await Customer.updateOne(
      {
        _id: data.id,
        company,
        "addresses._id": data.idAddress,
      },
      { $set: { "addresses.$.default": true } }
    );

    return {
      status: 200,
      message: "Set Address default successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> addCustomer", e);
    return {
      status: 400,
      message: "An error occurred while updating an address to the client.",
      detail: e,
    };
  }
}

export async function deleteAddress(data, company) {
  try {
    const foundCustomer = await Customer.findOne({
      _id: data.idParent,
      company,
    });
    let error = false;
    foundCustomer.addresses.map((address) => {
      if (address._id == data.id && address.default) {
        error = true;
      }
    });
    if (error) {
      return {
        status: 400,
        message: `The address is the default, it cannot be deleted`,
      };
    }
    await Customer.updateOne(
      {
        _id: data.idParent,
        company,
      },
      { $pull: { addresses: { _id: data.id, default: false } } }
    );

    return {
      status: 200,
      message: "Delete Address successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> addCustomer", e);
    return {
      status: 400,
      message: "An error occurred while updating an address to the client.",
      detail: e,
    };
  }
}

export async function addManyCustomers(data) {
  try {
    Customer.insertMany(data);
    return {
      status: 201,
      message: "Successfully added",
    };
  } catch (e) {
    console.log("[ERROR] -> addManyCustomers", e);
    return {
      status: 400,
      message: "An error occurred while creating the customer",
      detail: e,
    };
  }
}
