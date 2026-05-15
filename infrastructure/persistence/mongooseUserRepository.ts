import type { Types } from "mongoose";
import User from "./mongoose/userModel.js";
import Company from "./mongoose/companyModel.js";
import config from "../../config.js";
import type { UserRepository } from "../../application/ports/userRepository.js";
import type {
  RecoveryStepOneResult,
  RecoveryStepTwoResult,
  UserOutcome,
} from "../../application/types/userOutcome.js";

async function findUser(
  companyId: Types.ObjectId | string | null = null,
  userId: Types.ObjectId | string | null = null
) {
  try {
    let filter: Record<string, unknown> = {
      active: true,
    };
    if (companyId) {
      filter = {
        active: true,
        "companys.company": companyId,
      };
    }

    const select = "id name lastname role photo phone date email token companys";
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
      return null;
    }
    return response;
  } catch (e) {
    console.log("findUser error", e);
    return null;
  }
}

export class MongooseUserRepository implements UserRepository {
  async findActiveUserWithToken(
    userId: string,
    token: string
  ): Promise<unknown | null> {
    const user = await User.findOne({
      _id: userId,
      "tokens.token": token,
      active: true,
    });
    return user;
  }

  async getUser(userId: string | null): Promise<UserOutcome> {
    try {
      const list = await findUser(null, userId);

      if (list) {
        return {
          status: 200,
          message: list,
        };
      }
      return {
        status: 400,
        message: "User not found",
      };
    } catch (e) {
      console.log("getUser Store", e);
      return {
        status: 500,
        message: "Unexpected error",
        detail: e,
      };
    }
  }

  async getUsers(companyId: string | null): Promise<UserOutcome> {
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

  async addUser(user: Record<string, unknown>): Promise<UserOutcome> {
    try {
      const myUser = new User(user);
      await myUser.save();
      const { _id, name, lastname, role, photo, phone, email, date } = myUser;
      const token = await (
        myUser as typeof myUser & { generateAuthToken(): Promise<string> }
      ).generateAuthToken();
      const message = {
        _id,
        name,
        lastname,
        role,
        photo,
        phone,
        email,
        date,
        token,
      };
      return { status: 201, message };
    } catch (e) {
      return {
        status: 500,
        message: "User registration error",
        detail: e,
      };
    }
  }

  async registerUserPublic(request: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    docId: string;
    phone?: string;
  }): Promise<UserOutcome> {
    try {
      const { name, email, password, companyName, docId, phone } = request;
      const myUser = new User({ name, email, password, phone });
      await myUser.save();
      const adminUser = await User.findOne({ _id: config.userAdmin });
      if (!adminUser) {
        return {
          status: 500,
          message: "User registration error",
          detail: new Error("USER_ADMIN no configurado o inexistente"),
        };
      }
      const token = await (
        myUser as typeof myUser & { generateAuthToken(): Promise<string> }
      ).generateAuthToken();
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
      myUser.companys = myUser.companys.concat({
        company: myCompany._id,
        selected: true,
      });
      adminUser.companys = adminUser.companys.concat({
        company: myCompany._id,
        selected: false,
      });
      await myUser.save();
      await adminUser.save();
      const response = {
        _id: myUser._id,
        name,
        role: myUser.role,
        phone: myUser.phone,
        docId,
        email,
        date: myUser.date,
        token,
        company: companyName,
      };
      return { status: 201, message: response };
    } catch (e) {
      return {
        status: 500,
        message: "User registration error",
        detail: e,
      };
    }
  }

  async updateUser(user: {
    id: string;
    name?: string;
    lastname?: string;
    role?: "Administrador" | "Editor" | "Autor";
    photo?: string;
    phone?: string;
    password?: string;
  }): Promise<UserOutcome> {
    try {
      const foundUser = await User.findOne({
        _id: user.id,
      });
      if (!foundUser) {
        return {
          status: 400,
          message: "User not found",
        };
      }
      if (user.name) {
        foundUser.name = user.name;
      }
      if (user.lastname) {
        foundUser.lastname = user.lastname;
      }
      if (user.role) {
        foundUser.role = user.role;
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
      const { _id, name, lastname, role, photo, phone, email, date, active } =
        foundUser;
      const message = {
        _id,
        name,
        lastname,
        role,
        photo,
        phone,
        email,
        date,
        active,
      };
      return { status: 200, message };
    } catch (e) {
      return {
        status: 500,
        message: "Unexpected store error",
        detail: e,
      };
    }
  }

  async deleteUser(id: string): Promise<UserOutcome> {
    const foundUser = await User.findOne({
      _id: id,
    });
    if (!foundUser) {
      return { status: 400, message: "User not found" };
    }
    foundUser.active = false;
    await foundUser.save();

    return { status: 200, message: "User deleted" };
  }

  async loginUser(mail: string, pass: string): Promise<UserOutcome> {
    try {
      const user = await (
        User as unknown as {
          findByCredentials(
            m: string,
            p: string
          ): Promise<
            import("mongoose").Document & {
              generateAuthToken(): Promise<string>;
              companys: { selected: boolean; company: Types.ObjectId }[];
              _id: Types.ObjectId;
              name: string;
              lastname?: string;
              role?: "Administrador" | "Editor" | "Autor";
              phone?: string;
              photo?: string;
              email: string;
              date: Date;
            }
          >;
        }
      ).findByCredentials(mail, pass);
      const { _id, name, lastname, role, phone, photo, email, date, companys } =
        user;
      const selectedCompany = companys.find(
        (company: { selected: boolean }) => company.selected === true
      );
      if (!selectedCompany?.company) {
        return {
          status: 400,
          message:
            "No hay empresa seleccionada. Asocia o selecciona una empresa en tu cuenta.",
        };
      }
      const token = await user.generateAuthToken();
      const response = {
        _id,
        name,
        lastname,
        role,
        phone,
        photo,
        email,
        date,
        token,
        company: selectedCompany.company,
      };
      return { status: 200, message: response };
    } catch (error) {
      console.log("ERROR STORE LOGIN", error);
      return { status: 401, message: "User or password incorrect" };
    }
  }

  async logoutUser(id: string, tokenUser: string): Promise<void> {
    const foundUser = await User.findOne({
      _id: id,
    });
    if (!foundUser) {
      return;
    }
    foundUser.tokens = foundUser.tokens.filter((token: { token: string }) => {
      return token.token != tokenUser;
    });
    await foundUser.save();
  }

  async logoutAll(id: string): Promise<void> {
    const foundUser = await User.findOne({
      _id: id,
    });
    if (!foundUser) {
      return;
    }
    foundUser.tokens.splice(0, foundUser.tokens.length);
    await foundUser.save();
  }

  async changePassword(
    user: { email: string },
    newPass: string
  ): Promise<UserOutcome> {
    try {
      const foundUser = await User.findOne({
        email: user.email,
        active: true,
      });
      if (!foundUser) {
        return {
          status: 400,
          message: "User not found",
        };
      }
      foundUser.password = newPass;
      let saveError: unknown;
      await foundUser.save().catch(function (err: unknown) {
        saveError = err;
      });
      if (saveError) {
        return {
          status: 500,
          message: "Unexpected error",
          detail: saveError,
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

  async addCompany(userId: string, company: string): Promise<UserOutcome> {
    try {
      const foundUser = await User.findOne({
        _id: userId,
        active: true,
      });
      if (!foundUser) {
        return { status: 400, message: "User not found" };
      }

      let selected = false;
      if (foundUser.companys.length === 0) {
        selected = true;
      }
      const found = foundUser.companys.filter(
        (item: { company: Types.ObjectId }) =>
          String(item.company) == String(company)
      );

      if (found?.length > 0) {
        return {
          status: 400,
          message: "The company is already associated with this user",
        };
      }
      foundUser.companys = foundUser.companys.concat({
        company: company as unknown as Types.ObjectId,
        selected,
      });
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

  async removeCompany(userId: string, company: string): Promise<UserOutcome> {
    try {
      const foundUser = await User.findOne({
        _id: userId,
        active: true,
      });
      if (!foundUser) {
        return { status: 400, message: "User not found" };
      }

      foundUser.companys = foundUser.companys.filter(
        (item: { company: Types.ObjectId }) => {
          return String(item.company) != String(company);
        }
      );

      if (foundUser.companys.length === 0) {
        return {
          status: 400,
          message: "You cannot delete the only company associated with the user",
        };
      }
      foundUser.companys = foundUser.companys.map(
        (item: { company: Types.ObjectId; selected: boolean }) => {
          item.selected = false;
          return item;
        }
      );
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

  async selectCompany(userId: string, company: string): Promise<UserOutcome> {
    try {
      const foundUser = await User.findOne({
        _id: userId,
        active: true,
      });
      if (!foundUser) {
        return { status: 400, message: "User not found" };
      }
      const companyInUSer = foundUser.companys.find(
        (x: { company: Types.ObjectId }) => String(x.company) == String(company)
      );
      if (!companyInUSer) {
        return {
          status: 400,
          message: "The user does not have that company associated",
        };
      }

      foundUser.companys = foundUser.companys.map(
        (item: { company: Types.ObjectId; selected: boolean }) => {
          if (String(item.company) == String(company)) {
            item.selected = true;
          } else {
            item.selected = false;
          }
          return item;
        }
      );

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

  async recoveryStepOne(
    email: string,
    code: string
  ): Promise<RecoveryStepOneResult> {
    try {
      const foundUser = await User.findOne({ email, active: true });
      if (!foundUser) {
        return { status: false as const };
      }
      foundUser.recovery = foundUser.recovery.concat({ code });
      await foundUser.save();
      return {
        status: true as const,
        user: foundUser,
      };
    } catch (e) {
      console.log("ERROR -> recoveryStepOne ", e);
      return {
        status: false as const,
        text: "No existe el correo registrado en nuestra base de datos",
      };
    }
  }

  async recoveryStepTwo(
    email: string,
    code: string,
    newPass: string
  ): Promise<RecoveryStepTwoResult> {
    try {
      const foundUser = await User.findOne({
        email,
        "recovery.code": code,
        active: true,
      });
      if (!foundUser) {
        return { status: false as const };
      }
      foundUser.password = newPass;
      foundUser.recovery.splice(0, foundUser.recovery.length);
      await foundUser.save();
      return {
        status: true as const,
        user: foundUser,
      };
    } catch (e) {
      console.log("ERROR -> recoveryStepOne ", e);
      return {
        status: false as const,
        text: "Codigo incorrecto",
      };
    }
  }
}
