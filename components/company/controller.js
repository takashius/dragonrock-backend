import {
  getCompany as _getCompany,
  getCompanys as _getCompanys,
  addCompany as _addCompany,
  updateCompany as _updateCompany,
  deleteCompany as _deleteCompany,
  configCompany as _configCompany,
  uploadImage as _uploadImage,
} from "./store.js";

export async function getCompanys(filter) {
  try {
    const result = await _getCompanys(filter);
    return result;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getCompany(id) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Company ID is required",
      };
    }
    const result = await _getCompany(id);
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

export async function addCompany(company, user) {
  try {
    const fullCompany = await _addCompany(company, user);
    return fullCompany;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateCompany(company) {
  try {
    if (!company.id) {
      return {
        status: 400,
        message: "No company ID recived",
      };
    }
    const result = await _updateCompany(company);
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

export async function configCompany(company, userCompany, file) {
  try {
    if (!company.id) {
      return {
        status: 400,
        message: "No company ID recived",
      };
    }
    if (!userCompany.equals(company.id)) {
      return {
        status: 401,
        message: "You do not have access to the company you are trying to edit",
      };
    }
    const result = await _configCompany(company, file);
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

export async function uploadImage(company, imageType, file) {
  try {
    const result = await _uploadImage(company, imageType, file);
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

export async function deleteCompany(id) {
  try {
    const result = await _deleteCompany(id);
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
