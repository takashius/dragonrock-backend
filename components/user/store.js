import User from "./model.js";
import Company from "../company/model.js";
import config from "../../config.js";

async function findUser(companyId = null, userId = null) {
  try {
    let filter = {
      active: true,
    };
    if (companyId) {
      filter = {
        active: true,
        "companys.company": companyId,
      };
    }

    const select = "id name lastname photo phone date email token companys";
    const populateCompany = {
      path: "companys.company",
      model: "Company",
    };
    let response = null;

    if (userId !== null) {
      filter._id = userId;
      response = await User.findOne(filter)
        .select(select)
        .populate(populateCompany);
    } else {
      response = await User.find(filter)
        .select(select)
        .populate(populateCompany);
    }
    if (!response) {
      return empty_user_obj;
    }
    return response;
  } catch (e) {
    console.log("findUser error", e);
  }
}

export async function getUser(userId) {
  try {
    const list = await findUser(null, userId);

    if (list) {
      return {
        status: 200,
        message: list,
      };
    } else {
      return {
        status: 400,
        message: "User not found",
      };
    }
  } catch (e) {
    console.log("getUser Store", e);
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function getUsers(companyId) {
  try {
    const list = await findUser(companyId);
    return {
      status: 200,
      message: list,
    };
  } catch (e) {
    return {
      status: 500,
      message: "Unexpected error",
      detail: e,
    };
  }
}

export async function addUser(user) {
  try {
    const myUser = new User(user);
    await myUser.save();
    const { _id, name, lastname, photo, email, date } = myUser;
    const token = await myUser.generateAuthToken();
    user = { _id, name, lastname, photo, email, date, token };
    return { status: 201, message: user };
  } catch (e) {
    return {
      status: 500,
      message: "User registration error",
      detail: e,
    };
  }
}

export async function registerUserPublic(request) {
  try {
    const { name, email, password, companyName, docId } = request;
    const myUser = new User({ name, email, password });
    await myUser.save();
    const adminUSer = await User.findOne({ _id: config.userAdmin });
    const token = await myUser.generateAuthToken();
    const companyData = {
      name: companyName,
      email: email,
      rif: docId,
      created: {
        user: myUser._id,
      },
    };
    const myCompany = new Company(companyData);
    await myCompany.save();
    myUser.companys = myUser.companys.concat({ company: myCompany._id, selected: true });
    adminUSer.companys = adminUSer.companys.concat({ company: myCompany._id, selected: false });
    await myUser.save();
    await adminUSer.save();
    const response = { _id: myUser._id, name, clave: password, docId, password, email, date: myUser.date, token, company: companyName };
    return { status: 201, message: response };
  } catch (e) {
    return {
      status: 500,
      message: "User registration error",
      detail: e,
    };
  }
}

export async function updateUser(user) {
  try {
    const foundUser = await User.findOne({
      _id: user.id,
    });
    if (user.name) {
      foundUser.name = user.name;
    }
    if (user.lastname) {
      foundUser.lastname = user.lastname;
    }
    if (user.photo) {
      foundUser.photo = user.photo;
    }
    if (user.phone) {
      foundUser.phone = user.phone;
    }
    if (user.password) {
      foundUser.password = user.password;
    }

    await foundUser.save();
    const { _id, name, lastname, photo, email, date, active } = foundUser;
    user = { _id, name, lastname, photo, email, date, active };
    return { status: 200, message: user };
  } catch (e) {
    return {
      status: 500,
      message: "Unexpected store error",
      detail: e,
    };
  }
}

export async function deleteUser(id) {
  const foundUser = await User.findOne({
    _id: id,
  });
  foundUser.active = false;
  foundUser.save();

  return { status: 200, message: "User deleted" };
}

export async function loginUser(mail, pass) {
  try {
    const user = await User.findByCredentials(mail, pass);
    const { _id, name, lastname, photo, email, date, companys } = user;
    const selectedCompany = companys.find(company => company.selected === true);
    const token = await user.generateAuthToken();
    const response = { _id, name, lastname, photo, email, date, token, company: selectedCompany.company };
    return { status: 200, message: response };
  } catch (error) {
    console.log("ERROR STORE LOGIN", error);
    return { status: 401, message: "User or password incorrect" };
  }
}

export async function logoutUser(id, tokenUser) {
  const foundUser = await User.findOne({
    _id: id,
  });
  foundUser.tokens = foundUser.tokens.filter((token) => {
    return token.token != tokenUser;
  });
  await foundUser.save();
}

export async function logoutAll(id) {
  const foundUser = await User.findOne({
    _id: id,
  });
  foundUser.tokens.splice(0, foundUser.tokens.length);
  await foundUser.save();
}

export async function changePassword(user, newPass) {
  try {
    const foundUser = await User.findOne({
      email: user.email,
      active: true,
    });
    foundUser.password = newPass;
    let error = false;
    await foundUser.save().catch(function (err) {
      error = err;
    });
    if (error) {
      return {
        status: 500,
        message: "Unexpected error",
        detail: error,
      };
    }
    return {
      status: 200,
      message: "Password changed successfully",
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

export async function addCompany(userId, company) {
  try {
    const foundUser = await User.findOne({
      _id: userId,
      active: true,
    });

    let selected = false;
    if (foundUser.companys.length === 0) {
      selected = true;
    }
    const found = foundUser.companys.filter((item) => item.company == company);

    if (found?.length > 0) {
      return {
        status: 400,
        message: "The company is already associated with this user",
      };
    }
    foundUser.companys = foundUser.companys.concat({ company, selected });
    await foundUser.save();

    return {
      status: 200,
      message: "Company successfully added",
    };
  } catch (e) {
    console.log(e);
    return {
      status: 400,
      message: "Error adding company",
      detail: e,
    };
  }
}

export async function removeCompany(userId, company) {
  try {
    const foundUser = await User.findOne({
      _id: userId,
      active: true,
    });

    foundUser.companys = foundUser.companys.filter((item) => {
      return item.company != company;
    });

    if (foundUser.companys.length === 0) {
      return {
        status: 400,
        message: "You cannot delete the only company associated with the user",
      };
    }
    foundUser.companys = foundUser.companys.map((item) => {
      item.selected = false;
      return item;
    });
    foundUser.companys[0].selected = true;
    await foundUser.save();

    return {
      status: 200,
      message: "Company successfully removed",
    };
  } catch (e) {
    console.log(e);
    return {
      status: 400,
      message: "Error removing company",
      detail: e,
    };
  }
}

export async function selectCompany(userId, company) {
  try {
    const foundUser = await User.findOne({
      _id: userId,
      active: true,
    });
    const companyInUSer = foundUser.companys.find((x) => x.company == company);
    if (!companyInUSer) {
      return {
        status: 400,
        message: "The user does not have that company associated",
      };
    }

    foundUser.companys = foundUser.companys.map((item) => {
      if (item.company == company) {
        item.selected = true;
      } else {
        item.selected = false;
      }
      return item;
    });

    await foundUser.save();

    return {
      status: 200,
      message: "Company successfully selected",
    };
  } catch (e) {
    console.log(e);
    return {
      status: 400,
      message: "Error selecting company",
      detail: e,
    };
  }
}

export async function recoveryStepOne(email, code) {
  try {
    const foundUser = await User.findOne({ email, active: true });
    if (!foundUser) {
      return { status: false };
    }
    foundUser.recovery = foundUser.recovery.concat({ code });
    await foundUser.save();
    return {
      status: true,
      user: foundUser,
    };
  } catch (e) {
    console.log("ERROR -> recoveryStepOne ", e);
    return {
      status: false,
      text: "No existe el correo registrado en nuestra base de datos",
    };
  }
}

export async function recoveryStepTwo(email, code, newPass) {
  try {
    const foundUser = await User.findOne({
      email,
      "recovery.code": code,
      active: true,
    });
    if (!foundUser) {
      return { status: false };
    }
    foundUser.password = newPass;
    foundUser.recovery.splice(0, foundUser.recovery.length);
    foundUser.save();
    return {
      status: true,
      user: foundUser,
    };
  } catch (e) {
    console.log("ERROR -> recoveryStepOne ", e);
    return {
      status: false,
      text: "Codigo incorrecto",
    };
  }
}
