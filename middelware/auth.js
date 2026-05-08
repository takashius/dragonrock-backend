import jwt from "jsonwebtoken";
import User from "../components/user/model.js";
import config from "../config.js";

export default function auth(typeUserReq = 0) {
  return async (req, res, next) => {
    try {
      const rawAuth = req.header("Authorization") || "";
      const token = rawAuth.replace(/^Bearer\s+/i, "").trim();
      if (!token) {
        throw new Error("Authorization header missing");
      }
      const data = jwt.verify(token, config.JWT_KEY);
      const user = await User.findOne({
        _id: data._id,
        "tokens.token": token,
        active: true,
      });
      if (!user) {
        throw new Error();
      }
      const { _id, name, lastname, email, areacode, phone, companys } = user;
      const selectedCompanies = companys.filter((item) => item.selected);
      const selectedCompanyId = selectedCompanies[0]?.company;
      if (!selectedCompanyId) {
        throw new Error("No company selected");
      }
      req.user = {
        _id,
        name,
        lastname,
        email,
        areacode,
        phone,
        company: selectedCompanyId,
      };
      req.token = token;
      next();
    } catch (error) {
      console.log("AUTH ERROR", error);
      let message = "Not authorized to access this resource";
      if (error.message) {
        message = `Not authorized to access this resource - ${error.message}`;
      }
      res.status(401).send({ error: message });
    }
  };
}

const validatePermissions = (permissions, req) => {
  const method = req.method;
  const baseUrl = req.baseUrl;
  const path = req.route.path != "/" ? req.route.path : "";
  const pathFull = baseUrl + path;

  for (var c in permissions) {
    const itemPermission = permissions[c];
    for (var clave in itemPermission) {
      if (
        itemPermission[clave].fullpath == pathFull &&
        itemPermission[clave].method == method
      ) {
        if (itemPermission[clave].allow === 1) {
          return true;
        }
      }
    }
  }
  return false;
};
