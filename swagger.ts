import user from "./documentation/user.js";
import news from "./documentation/news.js";

const definition = {
  swagger: "2.0",
  info: {
    version: "2.0.0",
    title: "DragonRock API",
    description:
      "Backend DragonRock — API documentada alineada con rutas migradas (usuarios, noticias).",
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
    {
      name: "News",
      description: "Noticias por empresa",
    },
  ],
  consumes: ["application/json"],
  produces: ["application/json"],
  paths: {
    "/user/login": user.login,
    "/user/logout": user.logout,
    "/user/logoutall": user.logoutAll,
    "/user": user.create,
    "/user ": user.update,
    "/user  ": user.list,
    "/user/{id}": user.userByID,
    "/user/account": user.account,
    "/user/change_password": user.changePassword,
    "/user/add_company": user.addCompany,
    "/user/select_company": user.selectCompany,
    "/user/del_company": user.removeCompany,
    "/user/recovery/{email}": user.recoveryRequestCode,
    "/user/recovery": user.recoveryApplyCode,
    "/user/register": user.registerPublic,
    "/news": {
      get: news.listNews.get,
      post: news.createNews.post,
      patch: news.updateNews.patch,
    },
    "/news/paginate": news.paginateNews,
    "/news/{id}": news.newsById,
  },
  definitions: {
    ...user.definitions,
    ...news.definitions,
  },
};

export default definition;
