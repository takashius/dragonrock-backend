import {
  getNews as _getNews,
  getNewsDetail as _getNewsDetail,
  getPaginateNews as _getPaginateNews,
  addNews as _addNews,
  updateNews as _updateNews,
  deleteNews as _deleteNews,
} from "./store.js";
import type { Types } from "mongoose";

export async function getNews(
  id: string | null,
  company: Types.ObjectId | string
) {
  try {
    return await _getNews(id, company);
  } catch (e) {
    console.log("[ERROR] -> getNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getNewsDetail(
  id: string,
  company: Types.ObjectId | string
) {
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

export async function getPaginateNews(
  filter: unknown,
  page: unknown,
  company: Types.ObjectId | string
) {
  try {
    return await _getPaginateNews(filter, page, company);
  } catch (e) {
    console.log("[ERROR] -> getPaginateNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function addNews(
  data: Record<string, unknown>,
  user: Types.ObjectId | string,
  company: Types.ObjectId | string
) {
  try {
    return await _addNews(data, user, company);
  } catch (e) {
    console.log("[ERROR] -> addNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function updateNews(
  data: { id: string } & Record<string, unknown>,
  company: Types.ObjectId | string
) {
  try {
    return await _updateNews(data, company);
  } catch (e) {
    console.log("[ERROR] -> updateNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function deleteNews(
  id: string,
  company: Types.ObjectId | string
) {
  try {
    return await _deleteNews(id, company);
  } catch (e) {
    console.log("[ERROR] -> deleteNews", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}
