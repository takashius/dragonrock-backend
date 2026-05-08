import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import User from "../components/user/model.js";
import config from "../config.js";

export default function auth() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawAuth = req.header("Authorization") || "";
      const token = rawAuth.replace(/^Bearer\s+/i, "").trim();
      if (!token) {
        throw new Error("Authorization header missing");
      }
      const data = jwt.verify(token, config.JWT_KEY!) as {
        _id: string;
      };
      const user = await User.findOne({
        _id: data._id,
        "tokens.token": token,
        active: true,
      });
      if (!user) {
        throw new Error();
      }
      const { _id, name, lastname, email, phone, companys } = user;
      const selectedCompanies = companys.filter(
        (item: { selected: boolean }) => item.selected
      );
      const selectedCompanyId = selectedCompanies[0]?.company;
      if (!selectedCompanyId) {
        throw new Error("No company selected");
      }
      req.user = {
        _id,
        name,
        lastname,
        email,
        phone,
        company: selectedCompanyId,
      };
      req.token = token;
      next();
    } catch (error: unknown) {
      console.log("AUTH ERROR", error);
      let message = "Not authorized to access this resource";
      if (error instanceof Error && error.message) {
        message = `Not authorized to access this resource - ${error.message}`;
      }
      res.status(401).send({ error: message });
    }
  };
}
