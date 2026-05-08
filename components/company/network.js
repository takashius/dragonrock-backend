import express from "express";
import {
  getCompany,
  getCompanys,
  addCompany,
  updateCompany,
  configCompany,
  deleteCompany,
  uploadImage
} from "./controller.js";
import auth from "../../middelware/auth.js";
import controllerError from "../../middelware/controllerError.js";
const router = express.Router();
import upload from "../../middelware/saveFile.js";
import { v2 as cloudinary } from 'cloudinary';
import config from "../../config.js";

router.get("/", auth(), function (req, res) {
  getCompanys(null)
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

router.get("/myCompany", auth(), function (req, res) {
  getCompany(req.user.company)
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
  getCompany(req.params.id)
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
  addCompany(req.body, req.user._id)
    .then((data) => {
      switch (data.status) {
        case 201:
          res.status(201).send(data.message);
          break;
        default:
          console.log("DATA", JSON.stringify(data, null, 2));
          controllerError(data.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/upload", upload.single('image'), auth(), function (req, res) {
  uploadImage(req.user.company, req.body.imageType, req.file)
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(200).send(data.message);
          break;
        case 400:
        case 401:
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

router.patch("/", auth(), function (req, res) {
  updateCompany(req.body)
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

router.patch("/config", auth(), function (req, res) {
  configCompany(req.body, req.user.company)
    .then((data) => {
      switch (data.status) {
        case 200:
          res.status(200).send(data.message);
          break;
        case 400:
        case 401:
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

router.delete("/removeImage", auth(), function (req, res) {
  const url = req.body.url.split('/');
  const image = url[url.length - 1].split('.');
  cloudinary.uploader
    .destroy(config.cloudinary.FOLDER_NAME + '/' + image[0])
    .then(result => res.json(result))
    .catch(error => res.json(error));
});

router.delete("/:id", auth(), function (req, res) {
  deleteCompany(req.params.id)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Company ${req.params.id} eliminado`);
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
