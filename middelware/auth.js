import jwt from "jsonwebtoken";
import User from "../components/user/model.js";
import config from "../config.js";

export default function auth(typeUserReq = 0) {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const data = jwt.verify(token, config.JWT_KEY);
      if (data.date) {
        const dateLimit = sumDays(new Date(data.date), 5);
        const dateNow = new Date();
        if (+dateNow <= +dateLimit) {
          //throw new Error('Expired token');
        }
      } else {
        //throw new Error('Undated Token');
      }
      const user = await User.findOne({
        _id: data._id,
        "tokens.token": token,
        active: true,
      });
      if (!user) {
        throw new Error();
      }
      const { _id, name, lastname, email, areacode, phone, companys } = user;
      const company = companys.filter((item) => item.selected);
      req.user = {
        _id,
        name,
        lastname,
        email,
        areacode,
        phone,
        company: company[0].company,
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

const sumDays = (date, days) => {
  const newDate = date.getDate() + days;
  date.setDate(newDate);
  return date;
};

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
