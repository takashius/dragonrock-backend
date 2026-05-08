import {
  getNews as _getNews,
  getNewsDetail as _getNewsDetail,
  getPaginateNews as _getPaginateNews,
  addNews as _addNews,
  updateNews as _updateNews,
  deleteNews as _deleteNews,
} from "./store.js";

export async function getNews(id, company) {
  try {
    const result = await _getNews(id, company);
    return result;
  } catch (e) {
    console.log("[ERROR] -> getNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getNewsDetail(id, company) {
  try {
    return await _getNewsDetail(id, company);
  } catch (e) {
    console.log("[ERROR] -> getNewsDetail", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getPaginateNews(filter, page, company) {
  try {
    const result = await _getPaginateNews(filter, page, company);
    return result;
  } catch (e) {
    console.log("[ERROR] -> getPaginateNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function addNews(data, user, company) {
  try {
    const result = await _addNews(data, user, company);
    return result;
  } catch (e) {
    console.log("[ERROR] -> addNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function updateNews(data, company) {
  try {
    const result = await _updateNews(data, company);
    return result;
  } catch (e) {
    console.log("[ERROR] -> updateNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function deleteNews(id, company) {
  try {
    const result = await _deleteNews(id, company);
    return result;
  } catch (e) {
    console.log("[ERROR] -> deleteNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}