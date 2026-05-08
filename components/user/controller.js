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
import * as validator from 'email-validator';

export async function getUsers(filterUsers) {
  try {
    const result = await _getUsers(filterUsers);
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

export async function getUser(id) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }
    const result = await _getUser(id);
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

export async function addUser(user) {
  try {
    const fullUser = await _addUser(user);
    return fullUser;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function updateUser(user) {
  try {
    console.log(user);
    if (!user.id) {
      return {
        status: 400,
        message: "No user ID recived",
      };
    }
    const result = await update(user);
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

export async function deleteUser(id) {
  try {
    const result = await _deleteUser(id);
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

export async function loginUser(user) {
  try {
    const { email, password } = user;
    const result = await login(email, password);
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

export async function logoutUser(id, token) {
  try {
    const result = await logout(id, token);
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

export async function logoutAll(id) {
  try {
    const result = await _logoutAll(id);
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

export async function changePassword(user, newPass) {
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

export async function addCompany(user, company) {
  try {
    const fullUser = await _addCompany(user, company);
    return fullUser;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function removeCompany(user, company) {
  try {
    const fullUser = await _removeCompany(user, company);
    return fullUser;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function selectCompany(user, company) {
  try {
    const fullUser = await _selectCompany(user, company);
    return fullUser;
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}

export async function recoveryStepOne(mail) {
  try {
    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1) + min);
    const foundUser = await _recoveryStepOne(mail, code);
    if (!foundUser.status) {
      return {
        status: 400,
        message: "Correo no encontrado",
      };
    }
    const configCrud = await getCompany(config.companyDefault);
    const configCompany = configCrud.message;
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
    mailer(
      configCompany,
      mail,
      `${foundUser.user.name} ${foundUser.user.lastname}`,
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

export async function recoveryStepTwo(data) {
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
    const message = `
    <p>Se ha cambiado su contraseña exitosamente.</p>
    `;
    mailer(
      configCompany,
      data.email,
      `${foundUser.user.name} ${foundUser.user.lastname}`,
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

export async function registerUserPublic(data) {
  try {
    if (!data.email) {
      return { status: 400, message: { email: 'Email is required' } }
    }
    const isValid = validator.validate(data.email);

    if (!isValid) {
      return { status: 400, message: { email: "Email is not valid" } }
    }
    const user = await _registerUserPublic(data);
    const userData = user.message;
    const configCrud = await getCompany(config.companyDefault);
    const configCompany = configCrud.message;
    const message = `
    <p>Se ha registrado de forma exitosa en el sistema, a continuacion sus datos registrados en nuesta App.</p>
    <p>
      <ul>
        <li><strong>Nombre:</strong> ${userData.name}</li>
        <li><strong>Empresa:</strong> ${userData.company}</li>
        <li><strong>Rif:</strong> ${userData.docId}</li>
        <li><strong>Correo:</strong> ${userData.email}</li>
        <li><strong>Clave:</strong> ${userData.clave}</li>
      </ul>
    </p>
    `;
    mailer(
      configCompany,
      userData.email,
      `${userData.name}`,
      "Registro Exitoso",
      "Nuevo registro en el App ErCotizador",
      message
    );
    return user;
  } catch (e) {
    console.log('Controller -> registerUserPublic', e);
    return {
      status: 500,
      message: "Unexpected controller error",
      detail: e,
    };
  }
}