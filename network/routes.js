import user from "../components/user/network.js";
import company from "../components/company/network.js";
import product from "../components/products/network.js";
import customer from "../components/customers/network.js";
import cotiza from "../components/cotiza/network.js";
import moneyFlow from "../components/moneyFlow/network.js";
import news from "../components/news/network.js";

const url_api = "";

const routes = function (server) {
  server.use(url_api + "/user", user);
  server.use(url_api + "/company", company);
  server.use(url_api + "/product", product);
  server.use(url_api + "/customer", customer);
  server.use(url_api + "/cotiza", cotiza);
  server.use(url_api + "/moneyFlow", moneyFlow);
  server.use(url_api + "/news", news);
};

export default routes;
