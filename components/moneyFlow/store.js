import { Category, MoneyFlow } from "./model.js";

async function find({ companyId = null, id = null, simple = null, cotiza = null }) {
  try {
    let select = "";
    let filter = {
      active: true,
    };
    if (companyId) {
      filter.company = companyId;
    }
    if (cotiza) {
      filter.cotiza = cotiza;
    }
    if (simple) {
      select = "id title";
    } else {
      select = "id title amount type company category created";
    }
    const populateCreated = {
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    };
    const populateCategory = {
      path: "category",
      select: ["name"],
      model: "Category",
    };
    let response = null;

    if (id !== null) {
      filter._id = id;
      response = await MoneyFlow.findOne(filter)
        .select(select)
        .populate(populateCategory)
        .populate(populateCreated);
    } else {
      response = await MoneyFlow.find(filter)
        .select(select)
        .populate(!simple && populateCategory)
        .populate(!simple && populateCreated)
        .sort(simple ? { "title": 'asc' } : { "created.date": 'desc' });
    }
    return response;
  } catch (e) {
    console.log("find money flow error", e);
  }
}

export async function getMoneyFlow(id, company) {
  try {
    const result = await find({ companyId: company, id });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getMoneyFlow", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getMoneyFlowByCotiza(id, company) {
  try {
    const result = await find({ companyId: company, cotiza: id });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getMoneyFlow", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getMoneyFlows(company, simple) {
  try {
    const result = await find({ companyId: company, simple });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getMoneyFlows", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getPaginate(filter, page, companyId) {
  try {
    const limit = 20;
    let query = { active: true, company: companyId };
    let queryOr = null;
    let totalFlows = 0;
    let result = null;
    const populate = {
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    };
    const populateCategory = {
      path: "category",
      select: ["name"],
      model: "Category",
    };
    queryOr = [
      { title: { "$regex": filter, "$options": "i" } }
    ];

    const select = "id title amount type company category created";
    if (filter) {
      result = await MoneyFlow.find(query)
        .select(select)
        .or(queryOr)
        .populate(populate)
        .populate(populateCategory)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ "created.date": 'desc' });
    } else {
      result = await MoneyFlow.find(query)
        .select(select)
        .populate(populate)
        .populate(populateCategory)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ "created.date": 'desc' });
    }
    if (filter) {
      totalFlows = await MoneyFlow
        .countDocuments(query)
        .or(queryOr);
    } else {
      totalFlows = await MoneyFlow
        .countDocuments(query);
    }
    const totalPages = Math.ceil(totalFlows / limit);
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
        totalFlows,
        totalPages,
        currentPage: page,
        next: next(),
      }
    };
  } catch (e) {
    console.log("[ERROR] -> getPaginate Money Flows", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function addMoneyFlow(data, user, company) {
  try {
    const dataFlow = {
      title: data.title,
      amount: data.amount,
      type: data.type,
      category: data.category,
      cotiza: data.cotiza,
      company,
      created: {
        user,
      },
    };

    const flow = new MoneyFlow(dataFlow);
    const result = await flow.save();
    return {
      status: 201,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> addFlow", e);
    return {
      status: 400,
      message: "An error occurred while creating the flow",
      detail: e,
    };
  }
}

export async function updateMoneyFlow(data, company) {
  try {
    const foundData = await MoneyFlow.findOne({
      _id: data.id,
      company,
    });
    if (data.title) {
      foundData.title = data.title;
    }
    if (data.amount) {
      foundData.amount = data.amount;
    }
    if (data.type) {
      foundData.type = data.type;
    }
    if (data.category) {
      foundData.category = data.category;
    }

    await foundData.save();
    return {
      status: 200,
      message: "Money flow updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> updateFlow", e);
    return {
      status: 400,
      message: "An error occurred while updating the flow",
      detail: e,
    };
  }
}

export async function deleteMoneyFlow(id, company) {
  try {
    const foundData = await MoneyFlow.findOne({
      _id: id,
      company,
    });
    foundData.active = false;
    foundData.save();

    return { status: 200, message: "Money Flow deleted" };
  } catch (e) {
    console.log("[ERROR] -> deleteFlow", e);
    return {
      status: 400,
      message: "An error occurred while deleting the flow",
      detail: e,
    };
  }
}

export async function getCategories(company) {
  try {
    const result = await Category.find({ company, active: true }).select("id name");
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getCategories", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function addCategory(data, company) {
  try {
    const category = new Category({ name: data.name, company });
    const result = await category.save();
    return {
      status: 201,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> addCategory", e);
    return {
      status: 400,
      message: "An error occurred while creating the category",
      detail: e,
    };
  }
}
