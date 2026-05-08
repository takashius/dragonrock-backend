import Company from "./model.js";

/** Lectura de empresa (p. ej. plantilla de correo desde `COMPANY_DEFAULT`) */
export async function getCompany(id) {
  try {
    let query = { active: true };
    if (id) {
      query = { _id: id };
    }

    const result = await Company.findOne(query).populate({
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getCompany", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}
