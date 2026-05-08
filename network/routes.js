import user from "../components/user/network.js";
import news from "../components/news/network.js";

const url_api = "";

const routes = function (server) {
  server.use(url_api + "/user", user);
  server.use(url_api + "/news", news);
};

export default routes;
