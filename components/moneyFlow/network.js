import express from "express";
import {
  getMoneyFlows,
  getMoneyFlow,
  getMoneyFlowByCotiza,
  addMoneyFlow,
  updateMoneyFlow,
  deleteMoneyFlow,
  getCategories,
  addCategory
} from "./controller.js";
import auth from "../../middelware/auth.js";
import controllerError from "../../middelware/controllerError.js";
const router = express.Router();

router.get("/simple", auth(), function (req, res) {
  getMoneyFlows(null, null, req.user.company, true)
    .then((list) => {
      switch (list.status) {
        case 200:
          res.status(200).send(list.message);
          break;
        default:
          res.status(list.status).send(list.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/list/:page?/:pattern?", auth(), function (req, res) {
  getMoneyFlows(req.params.pattern, req.params.page, req.user.company)
    .then((list) => {
      switch (list.status) {
        case 200:
          res.status(200).send(list.message);
          break;
        default:
          res.status(list.status).send(list.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/categories", auth(), function (req, res) {
  getCategories(req.user.company)
    .then((list) => {
      switch (list.status) {
        case 200:
          res.status(200).send(list.message);
          break;
        default:
          res.status(list.status).send(list.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/cotiza/:id", auth(), function (req, res) {
  getMoneyFlowByCotiza(req.params.id, req.user.company)
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(200).send(data.message);
          break;
        default:
          res.status(data.status).send(data.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/:id", auth(), function (req, res) {
  getMoneyFlow(req.params.id, req.user.company)
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(200).send(data.message);
          break;
        default:
          res.status(data.status).send(data.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/", auth(), function (req, res) {
  addMoneyFlow(req.body, req.user._id, req.user.company)
    .then((data) => {
      switch (data.status) {
        case 201:
          res.status(201).send(data.message);
          break;
        default:
          controllerError(data.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/category", auth(), function (req, res) {
  addCategory(req.body, req.user.company)
    .then((data) => {
      switch (data.status) {
        case 201:
          res.status(201).send(data.message);
          break;
        default:
          controllerError(data.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.patch("/", auth(), function (req, res) {
  updateMoneyFlow(req.body, req.user.company)
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(200).send(data.message);
          break;
        case 400:
          res.status(data.status).send(data.message);
          break;
        default:
          controllerError(data.detail, req, res);
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.delete("/:id", auth(), function (req, res) {
  deleteMoneyFlow(req.params.id, req.user.company)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Money flow ${req.params.id} deleted`);
          break;
        case 400:
          res.status(resp.status).send(resp.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

export default router;
