import {
  getUsers as _getUsers,
  getUser as _getUser,
  addUser as _addUser,
  updateUser as update,
  deleteUser as _deleteUser,
  loginUser as login,
  logoutUser as logout,
  logoutAll as _logoutAll,
  changePassword as _changePassword,
  addCompany as _addCompany,
  removeCompany as _removeCompany,
  selectCompany as _selectCompany,
  recoveryStepOne as _recoveryStepOne,
  recoveryStepTwo as _recoveryStepTwo,
  registerUserPublic as _registerUserPublic,
} from "./store.js";
import config from "../../config.js";
import { mailer } from "../../middelware/mailer.js";
import { getCompany } from "../company/store.js";
import * as validator from "email-validator";
import type { Types } from "mongoose";
import type { AuthUserPayload } from "../../types/auth.js";

export async function getUsers(filterUsers: Types.ObjectId | string | null) {
  try {
    return await _getUsers(filterUsers);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getUser(id: Types.ObjectId | string | null) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }
    return await _getUser(id);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function addUser(user: Record<string, unknown>) {
  try {
    return await _addUser(user);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateUser(user: {
  id: string;
  name?: string;
  lastname?: string;
  photo?: string;
  phone?: string;
  password?: string;
}) {
  try {
    console.log(user);
    if (!user.id) {
      return {
        status: 400,
        message: "No user ID recived",
      };
    }
    return await update(user);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function deleteUser(id: string) {
  try {
    return await _deleteUser(id);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function loginUser(user: { email: string; password: string }) {
  try {
    const { email, password } = user;
    return await login(email, password);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function logoutUser(
  id: Types.ObjectId | string,
  token: string
) {
  try {
    return await logout(id, token);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function logoutAll(id: Types.ObjectId | string) {
  try {
    return await _logoutAll(id);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function changePassword(
  user: AuthUserPayload,
  newPass: string
) {
  try {
    if (!user || !newPass) {
      return {
        status: 400,
        message: "User or Password not received",
      };
    }
    return _changePassword(user, newPass);
  } catch (e) {
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function addCompany(
  user: Types.ObjectId | string,
  company: Types.ObjectId | string
) {
  try {
    return await _addCompany(user, company);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function removeCompany(
  user: AuthUserPayload,
  company: Types.ObjectId | string
) {
  try {
    return await _removeCompany(user._id, company);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function selectCompany(
  user: AuthUserPayload,
  company: Types.ObjectId | string
) {
  try {
    return await _selectCompany(user._id, company);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function recoveryStepOne(mail: string) {
  try {
    const min = 100000;
    const max = 999999;
    const code = String(Math.floor(Math.random() * (max - min + 1) + min));
    const foundUser = await _recoveryStepOne(mail, code);
    if (!foundUser.status) {
      return {
        status: 400,
        message: "Correo no encontrado",
      };
    }
    const configCrud = await getCompany(config.companyDefault);
    const configCompany = configCrud.message;
    if (!configCompany) {
      return { status: 500, message: "Configuración de empresa por defecto no encontrada" };
    }
    const message = `
    <p>Ha solicitado restaurar su clave de acceso, copia el siguiente código en la pantalla de la aplicación para reestablecer su contraseña.</br>
    Si usted no solicitó este correo solo debe ignorarlo.</p>
    <p>
      Sus código es el siguiente: </br>
      <center>
        <h1 style="color: #153643; font-family: Arial, sans-serif; font-size: 42px;">${code}</h1>
      </center>
    </p>
    `;
    await mailer(
      configCompany,
      mail,
      `${foundUser.user.name} ${foundUser.user.lastname ?? ""}`,
      "Recuperar contraseña",
      "Recuperación de clave",
      message
    );
    return {
      status: 200,
      message: "Email sent with the generated code",
    };
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function recoveryStepTwo(data: {
  email: string;
  code: string;
  newPass: string;
}) {
  try {
    const foundUser = await _recoveryStepTwo(
      data.email,
      data.code,
      data.newPass
    );
    if (!foundUser.status) {
      return {
        status: 400,
        message: "Codigo incorrecto",
      };
    }
    const configCrud = await getCompany(config.companyDefault);
    const configCompany = configCrud.message;
    if (!configCompany) {
      return { status: 500, message: "Configuración de empresa por defecto no encontrada" };
    }
    const message = `
    <p>Se ha cambiado su contraseña exitosamente.</p>
    `;
    await mailer(
      configCompany,
      data.email,
      `${foundUser.user.name} ${foundUser.user.lastname ?? ""}`,
      "Cambio de clave exitoso",
      "Cambio de clave",
      message
    );
    return {
      status: 200,
      message: "Your password has been changed successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function registerUserPublic(data: {
  name: string;
  email: string;
  password: string;
  companyName: string;
  docId: string;
}) {
  try {
    if (!data.email) {
      return { status: 400, message: { email: "Email is required" } };
    }
    const isValid = validator.validate(data.email);

    if (!isValid) {
      return { status: 400, message: { email: "Email is not valid" } };
    }
    const user = await _registerUserPublic(data);
    if (user.status !== 201 || !("message" in user) || !user.message) {
      return user;
    }
    const userData = user.message as {
      name: string;
      company: string;
      docId: string;
      email: string;
    };
    const configCrud = await getCompany(config.companyDefault);
    const configCompany = configCrud.message;
    if (!configCompany) {
      return { status: 500, message: "Configuración de empresa por defecto no encontrada" };
    }
    const message = `
    <p>Se ha registrado de forma exitosa en el sistema, a continuación sus datos registrados en nuestra App.</p>
    <p>
      <ul>
        <li><strong>Nombre:</strong> ${userData.name}</li>
        <li><strong>Empresa:</strong> ${userData.company}</li>
        <li><strong>Rif:</strong> ${userData.docId}</li>
        <li><strong>Correo:</strong> ${userData.email}</li>
      </ul>
    </p>
    `;
    await mailer(
      configCompany,
      userData.email,
      `${userData.name}`,
      "Registro Exitoso",
      "Nuevo registro en DragonRock",
      message
    );
    return user;
  } catch (e) {
    console.log("Controller -> registerUserPublic", e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}
