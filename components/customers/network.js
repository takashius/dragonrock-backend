import express from "express";
import {
  getCustomers,
  getCustomer,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addAddress,
  updateAddress,
  setAddressDefault,
  deleteAddress,
  importCustomers
} from "./controller.js";
import auth from "../../middelware/auth.js";
import controllerError from "../../middelware/controllerError.js";
const router = express.Router();

router.get("/simple", auth(), function (req, res) {
  getCustomers(null, null, req.user.company, true)
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

router.get("/import", auth(), function (req, res) {
  importCustomers(req.user._id, req.user.company)
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
  getCustomers(req.params.pattern, req.params.page, req.user.company)
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

router.get("/:id", auth(), function (req, res) {
  getCustomer(req.params.id, req.user.company)
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
  addCustomer(req.body, req.user._id, req.user.company)
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

router.post("/address", auth(), function (req, res) {
  addAddress(req.body, req.user.company)
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(200).send(data.message);
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
  updateCustomer(req.body, req.user.company)
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

router.patch("/address", auth(), function (req, res) {
  updateAddress(req.body, req.user.company)
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

router.patch("/address/default", auth(), function (req, res) {
  setAddressDefault(req.body, req.user.company)
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

router.delete("/address", auth(), function (req, res) {
  deleteAddress(req.body, req.user.company)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Address deleted`);
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

router.delete("/:id", auth(), function (req, res) {
  deleteCustomer(req.params.id, req.user.company)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Customer ${req.params.id} deleted`);
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
