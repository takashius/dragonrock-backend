import {
  getMoneyFlow as getFlow,
  getMoneyFlows as getFlows,
  addMoneyFlow as addFlow,
  updateMoneyFlow as updateFlow,
  deleteMoneyFlow as deleteFlow,
  getCategories as _getCategories,
  addCategory as _addCategory,
  getMoneyFlowByCotiza as getMoneyFlowCotiza,
  getPaginate
} from "./store.js";

export async function getMoneyFlows(filter, page, company, simple) {
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
      result = await getFlows(company, simple);
      result.message.map((item) => {
        newArray.push({
          id: item._id,
          title: item.title
        })
      });
    } else {
      result = await getPaginate(filter, page, company);
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

export async function getMoneyFlow(id, company) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Money Flow ID is required",
      };
    }
    const result = await getFlow(id, company);
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

export async function getMoneyFlowByCotiza(id, company) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Cotiza ID is required",
      };
    }
    const result = await getMoneyFlowCotiza(id, company);
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

export async function addMoneyFlow(flow, user, company) {
  try {
    const fullData = await addFlow(flow, user, company);
    return fullData;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateMoneyFlow(flow, company) {
  try {
    if (!flow.id) {
      return {
        status: 400,
        message: "No flow ID received",
      };
    }
    const result = await updateFlow(flow, company);
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

export async function deleteMoneyFlow(id, company) {
  try {
    const result = await deleteFlow(id, company);
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

export async function addCategory(category, company) {
  try {
    const fullData = await _addCategory(category, company);
    return fullData;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function getCategories(company) {
  try {
    const result = await _getCategories(company);
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