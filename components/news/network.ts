import express from "express";
import {
  getNews,
  getNewsDetail,
  getPaginateNews,
  addNews,
  updateNews,
  deleteNews,
} from "./controller.js";
import auth from "../../middelware/auth.js";
import controllerError from "../../middelware/controllerError.js";
const router = express.Router();

router.get("/", auth(), function (req, res) {
  getNews(null, req.user!.company)
    .then((news) => {
      switch (news.status) {
        case 200:
          res.status(200).send(news.message);
          break;
        default:
          if ("detail" in news && news.detail) {
            controllerError(news.detail, req, res);
          } else {
            res.status(news.status).send(news.message);
          }
          break;
      }
    })
    .catch((e) => {
      console.log("[ERROR] -> getNews", e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/paginate", auth(), function (req, res) {
  getPaginateNews(req.query.filter, req.query.page, req.user!.company)
    .then((news) => {
      switch (news.status) {
        case 200:
          res.status(200).send(news.message);
          break;
        default:
          if ("detail" in news && news.detail) {
            controllerError(news.detail, req, res);
          } else {
            res.status(news.status).send(news.message);
          }
          break;
      }
    })
    .catch((e) => {
      console.log("[ERROR] -> addNews", e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/:id", auth(), function (req, res) {
  getNewsDetail(req.params.id, req.user!.company)
    .then((news) => {
      switch (news.status) {
        case 200:
          res.status(200).send(news.message);
          break;
        case 404:
          res.status(404).send(news.message);
          break;
        case 400:
          res.status(400).send(news.message);
          break;
        default:
          if ("detail" in news && news.detail) {
            controllerError(news.detail, req, res);
          } else {
            res.status(news.status).send(news.message);
          }
          break;
      }
    })
    .catch((e) => {
      console.log("[ERROR] -> getNewsDetail", e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/", auth(), function (req, res) {
  addNews(req.body, req.user!._id, req.user!.company)
    .then((news) => {
      switch (news.status) {
        case 200:
          res.status(200).send(news.message);
          break;
        default:
          if ("detail" in news && news.detail) {
            controllerError(news.detail, req, res);
          } else {
            res.status(news.status).send(news.message);
          }
          break;
      }
    })
    .catch((e) => {
      console.log("[ERROR] -> addNews", e);
      res.status(500).send("Unexpected Error");
    });
});

router.patch("/", auth(), function (req, res) { 
  updateNews(req.body, req.user!.company)
    .then((news) => {
      switch (news.status) {
        case 200:
          res.status(200).send(news.message);
          break;
        default:
          if ("detail" in news && news.detail) {
            controllerError(news.detail, req, res);
          } else {
            res.status(news.status).send(news.message);
          }
          break;
      }
    })
    .catch((e) => { 
      console.log("[ERROR] -> updateNews", e);
      res.status(500).send("Unexpected Error");
    });
});

router.delete("/:id", auth(), function (req, res) {
  deleteNews(req.params.id, req.user!.company)
    .then((news) => {
      switch (news.status) {
        case 200:
          res.status(200).send(news.message);
          break;
        default:
          if ("detail" in news && news.detail) {
            controllerError(news.detail, req, res);
          } else {
            res.status(news.status).send(news.message);
          }
          break;
      }
    })
    .catch((e) => {
      console.log("[ERROR] -> deleteNews", e);
      res.status(500).send("Unexpected Error");
    });
});

export default router;