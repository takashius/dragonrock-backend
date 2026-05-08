import express from "express";
import {
  getUsers,
  getUser,
  addUser,
  deleteUser,
  updateUser,
  loginUser,
  logoutUser,
  logoutAll,
  changePassword,
  addCompany,
  removeCompany,
  selectCompany,
  recoveryStepOne,
  recoveryStepTwo,
  registerUserPublic,
} from "./controller.js";
import auth from "../../middelware/auth.js";
import controllerError from "../../middelware/controllerError.js";
const router = express.Router();

router.get("/", auth(), function (req, res) {
  getUsers(null)
    .then((userList) => {
      switch (userList.status) {
        case 200:
          res.status(200).send(userList.message);
          break;
        default:
          res.status(userList.status).send(userList.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/account", auth(), function (req, res) {
  getUser(req.user._id)
    .then((userList) => {
      switch (userList.status) {
        case 200:
          res.status(200).send(userList.message);
          break;
        default:
          res.status(userList.status).send(userList.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected network Error");
    });
});

router.get("/recovery/:email", function (req, res) {
  recoveryStepOne(req.params.email)
    .then((result) => {
      switch (result.status) {
        case 200:
          res.status(200).send(result.message);
          break;
        default:
          res.status(result.status).send(result.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected network Error");
    });
});

router.get("/:id", auth(), function (req, res) {
  getUser(req.params.id)
    .then((userList) => {
      switch (userList.status) {
        case 200:
          res.status(200).send(userList.message);
          break;
        default:
          res.status(userList.status).send(userList.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/", auth(), function (req, res) {
  addUser(req.body)
    .then((user) => {
      switch (user.status) {
        case 201:
          res.status(201).send(user.message);
          break;
        default:
          controllerError(user.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/register", function (req, res) {
  registerUserPublic(req.body)
    .then((user) => {
      switch (user.status) {
        case 201:
          res.status(201).send(user.message);
          break;
        case 400:
          res.status(user.status).send(user.message);
          break;
        default:
          controllerError(user.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/recovery", function (req, res) {
  recoveryStepTwo(req.body)
    .then((user) => {
      switch (user.status) {
        case 200:
          res.status(200).send(user.message);
          break;
        default:
          controllerError(user.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.delete("/del_company", auth(), function (req, res) {
  removeCompany(req.user, req.body.company)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Company removed`);
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
  deleteUser(req.params.id)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Usuario ${req.params.id} eliminado`);
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

router.patch("/", auth(), function (req, res) {
  updateUser(req.body)
    .then((user) => {
      switch (user.status) {
        case 200:
          res.status(200).send(user.message);
          break;
        case 400:
          res.status(user.status).send(user.message);
          break;
        default:
          controllerError(user.detail, req, res);
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.patch("/select_company", auth(), function (req, res) {
  selectCompany(req.user, req.body.company)
    .then((user) => {
      switch (user.status) {
        case 200:
          res.status(200).send(user.message);
          break;
        case 400:
          res.status(user.status).send(user.message);
          break;
        default:
          controllerError(user.detail, req, res);
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/login", async (req, res) => {
  loginUser(req.body)
    .then((user) => {
      switch (user.status) {
        case 200:
          res.status(200).send(user.message);
          break;
        default:
          res.status(user.status).send(user.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/logout", auth(), async (req, res) => {
  logoutUser(req.user._id, req.token)
    .then((user) => {
      res.status(200).send("Logout successful");
    })
    .catch((e) => {
      res.status(400).send("Invalid user data");
    });
});

router.post("/logoutall", auth(), async (req, res) => {
  logoutAll(req.user._id)
    .then((user) => {
      res.status(200).send("Logout successful");
    })
    .catch((e) => {
      res.status(400).send("Invalid user data");
    });
});

router.post("/change_password", auth(), function (req, res) {
  changePassword(req.user, req.body.password)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(resp.status).send(resp.message);
          break;
        case 400:
          res.status(resp.status).send(resp.message);
          break;
        default:
          controllerError(resp.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/add_company", auth(), function (req, res) {
  addCompany(req.body.user, req.body.company)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(resp.status).send(resp.message);
          break;
        case 400:
          res.status(resp.status).send(resp.message);
          break;
        default:
          controllerError(resp.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

export default router;
