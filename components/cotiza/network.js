import express from "express";
import {
  getCotiza,
  getCotizas,
  addCotiza,
  updateCotiza,
  deleteCotiza,
  addProduct,
  updateProduct,
  updateCotizaRate,
  deleteProduct,
  getPdf,
  sendByEmail,
} from "./controller.js";
import auth from "../../middelware/auth.js";
import controllerError from "../../middelware/controllerError.js";
const router = express.Router();

router.get("/", auth(), function (req, res) {
  getCotizas(req.user.company)
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

router.get("/pdf/:id", auth(), function (req, res) {
  getPdf(req.params.id, req.user.company, res, false)
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(201);
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

router.get("/pdflibre/:id", auth(), function (req, res) {
  getPdf(req.params.id, req.user.company, res, 'libre')
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(201);
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

router.get("/pdf/presupuesto/:id", auth(), function (req, res) {
  getPdf(req.params.id, req.user.company, res, 'presupuesto')
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(201);
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

router.get("/send/:id", auth(), function (req, res) {
  sendByEmail(req.params.id, req.user.company)
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
  getCotiza(req.params.id, req.user.company)
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
  addCotiza(req.body, req.user._id, req.user.company)
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

router.post("/product", auth(), function (req, res) {
  addProduct(req.body, req.user.company)
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
  updateCotiza(req.body, req.user.company)
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

router.patch("/updateRate", auth(), function (req, res) {
  updateCotizaRate(req.body.id, req.user.company)
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

router.patch("/product", auth(), function (req, res) {
  updateProduct(req.body, req.user.company)
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

router.delete("/product", auth(), function (req, res) {
  deleteProduct(req.body, req.user.company)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(resp.message);
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
  deleteCotiza(req.params.id, req.user.company)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Product ${req.params.id} deleted`);
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
