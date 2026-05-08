import user from "./documentation/user.js";

const definition = {
  swagger: "2.0",
  info: {
    version: "2.0.0",
    title: "DragonRock API",
    description: "Backend DragonRock (usuarios y noticias)",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: "localhost:3031",

  servers: [
    {
      url: "http://localhost:3031",
      description: "Servidor local",
    },
  ],

  tags: [
    {
      name: "Users",
      description: "Gestión de usuarios",
    },
  ],
  consumes: ["application/json"],
  produces: ["application/json"],
  paths: {
    "/user/login": user.login,
    "/user/logout": user.logout,
    "/user": user.create,
    "/user ": user.update,
    "/user  ": user.list,
    "/user/{id}": user.userByID,
    "/user/account": user.account,
    "/user/change_password": user.changePassword,
    "/user/add_company": user.addCompany,
    "/user/select_company": user.selectCompany,
    "/user/del_company": user.removeCompany,
  },
  definitions: {
    User: user.definitions.User,
    Users: user.definitions.Users,
    ResponseUserLoginData: user.definitions.ResponseUserLoginData,
    ResponseUserData: user.definitions.ResponseUserData,
  },
};

export default definition;
