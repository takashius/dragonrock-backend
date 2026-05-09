import express, { type Router } from "express";
import type { AuthMiddlewareFactory } from "./authMiddlewareFactory.js";
import type { ListUsersUseCase } from "../../application/user/listUsersUseCase.js";
import type { GetUserUseCase } from "../../application/user/getUserUseCase.js";
import type { AddUserUseCase } from "../../application/user/addUserUseCase.js";
import type { DeleteUserUseCase } from "../../application/user/deleteUserUseCase.js";
import type { UpdateUserUseCase } from "../../application/user/updateUserUseCase.js";
import type { LoginUserUseCase } from "../../application/user/loginUserUseCase.js";
import type { LogoutUserUseCase } from "../../application/user/logoutUserUseCase.js";
import type { LogoutAllUseCase } from "../../application/user/logoutAllUseCase.js";
import type { ChangePasswordUseCase } from "../../application/user/changePasswordUseCase.js";
import type { AddCompanyUseCase } from "../../application/user/addCompanyUseCase.js";
import type { RemoveCompanyUseCase } from "../../application/user/removeCompanyUseCase.js";
import type { SelectCompanyUseCase } from "../../application/user/selectCompanyUseCase.js";
import type { RecoveryStepOneUseCase } from "../../application/user/recoveryStepOneUseCase.js";
import type { RecoveryStepTwoUseCase } from "../../application/user/recoveryStepTwoUseCase.js";
import type { RegisterUserPublicUseCase } from "../../application/user/registerUserPublicUseCase.js";
import { sendUserOutcomeWithDetail } from "./userHttpMapper.js";
import { sendStoreDetailError } from "./sendStoreDetailError.js";
import {
  loginRateLimiter,
  sensitivePublicRateLimiter,
} from "./rateLimiters.js";
import { validateBody, validateParams } from "./validateRequest.js";
import {
  addCompanyBodySchema,
  addUserBodySchema,
  changePasswordBodySchema,
  companyIdBodySchema,
  loginBodySchema,
  mongoIdParamSchema,
  recoveryEmailParamSchema,
  recoveryRequestBodySchema,
  recoveryStepTwoBodySchema,
  registerPublicBodySchema,
  updateUserBodySchema,
  type AddCompanyBody,
  type AddUserBody,
  type ChangePasswordBody,
  type CompanyIdBody,
  type LoginBody,
  type RecoveryRequestBody,
  type RecoveryStepTwoBody,
  type RegisterPublicBody,
  type UpdateUserBody,
} from "./schemas/routeSchemas.js";

export type UserRouterDeps = {
  auth: AuthMiddlewareFactory;
  listUsers: ListUsersUseCase;
  getUser: GetUserUseCase;
  addUser: AddUserUseCase;
  deleteUser: DeleteUserUseCase;
  updateUser: UpdateUserUseCase;
  loginUser: LoginUserUseCase;
  logoutUser: LogoutUserUseCase;
  logoutAll: LogoutAllUseCase;
  changePassword: ChangePasswordUseCase;
  addCompany: AddCompanyUseCase;
  removeCompany: RemoveCompanyUseCase;
  selectCompany: SelectCompanyUseCase;
  recoveryStepOne: RecoveryStepOneUseCase;
  recoveryStepTwo: RecoveryStepTwoUseCase;
  registerUserPublic: RegisterUserPublicUseCase;
};

export function createUserRouter(deps: UserRouterDeps): Router {
  const router = express.Router();
  const { auth } = deps;

  router.get("/", auth(), function (_req, res) {
    deps.listUsers
      .execute()
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
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  });

  router.get("/account", auth(), function (req, res) {
    deps.getUser
      .execute(String(req.user!._id))
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
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected network Error");
      });
  });

  router.post(
    "/recovery/request",
    validateBody(recoveryRequestBodySchema),
    sensitivePublicRateLimiter,
    function (req, res) {
      const body = req.body as RecoveryRequestBody;
      deps.recoveryStepOne
        .execute(body.email)
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
        .catch((e: unknown) => {
          console.log(e);
          res.status(500).send("Unexpected network Error");
        });
    }
  );

  router.get(
    "/recovery/:email",
    validateParams(recoveryEmailParamSchema),
    sensitivePublicRateLimiter,
    function (req, res) {
      deps.recoveryStepOne
        .execute(req.params.email)
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
        .catch((e: unknown) => {
          console.log(e);
          res.status(500).send("Unexpected network Error");
        });
    }
  );

  router.get(
    "/:id",
    auth(),
    validateParams(mongoIdParamSchema),
    function (req, res) {
    deps.getUser
      .execute(req.params.id)
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
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  });

  router.post("/", auth(), validateBody(addUserBodySchema), function (req, res) {
    deps.addUser
      .execute(req.body as AddUserBody)
      .then((user) => {
        switch (user.status) {
          case 201:
            res.status(201).send(user.message);
            break;
          default:
            sendUserOutcomeWithDetail(res, req, user);
            break;
        }
      })
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  });

  router.post(
    "/register",
    validateBody(registerPublicBodySchema),
    sensitivePublicRateLimiter,
    function (req, res) {
    deps.registerUserPublic
      .execute(req.body as RegisterPublicBody)
      .then((user) => {
        switch (user.status) {
          case 201:
            res.status(201).send(user.message);
            break;
          case 400:
            res.status(user.status).send(user.message);
            break;
          default:
            sendUserOutcomeWithDetail(res, req, user);
            break;
        }
      })
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  router.post(
    "/recovery",
    validateBody(recoveryStepTwoBodySchema),
    sensitivePublicRateLimiter,
    function (req, res) {
    deps.recoveryStepTwo
      .execute(req.body as RecoveryStepTwoBody)
      .then((user) => {
        switch (user.status) {
          case 200:
            res.status(200).send(user.message);
            break;
          default:
            sendUserOutcomeWithDetail(res, req, user);
            break;
        }
      })
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  router.delete(
    "/del_company",
    auth(),
    validateBody(companyIdBodySchema),
    function (req, res) {
    deps.removeCompany
      .execute(String(req.user!._id), (req.body as CompanyIdBody).company)
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
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  router.delete(
    "/:id",
    auth(),
    validateParams(mongoIdParamSchema),
    function (req, res) {
    deps.deleteUser
      .execute(req.params.id)
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
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  router.patch("/", auth(), validateBody(updateUserBodySchema), function (req, res) {
    deps.updateUser
      .execute(req.body as UpdateUserBody)
      .then((user) => {
        switch (user.status) {
          case 200:
            res.status(200).send(user.message);
            break;
          case 400:
            res.status(user.status).send(user.message);
            break;
          default:
            sendUserOutcomeWithDetail(res, req, user);
            break;
        }
      })
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  });

  router.patch(
    "/select_company",
    auth(),
    validateBody(companyIdBodySchema),
    function (req, res) {
    deps.selectCompany
      .execute(String(req.user!._id), (req.body as CompanyIdBody).company)
      .then((user) => {
        switch (user.status) {
          case 200:
            res.status(200).send(user.message);
            break;
          case 400:
            res.status(user.status).send(user.message);
            break;
          default:
            sendUserOutcomeWithDetail(res, req, user);
            break;
        }
      })
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  router.post(
    "/login",
    validateBody(loginBodySchema),
    loginRateLimiter,
    function (req, res) {
    deps.loginUser
      .execute(req.body as LoginBody)
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
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  router.post("/logout", auth(), function (req, res) {
    deps.logoutUser
      .execute(String(req.user!._id), req.token!)
      .then(() => {
        res.status(200).send("Logout successful");
      })
      .catch(() => {
        res.status(400).send("Invalid user data");
      });
  });

  router.post("/logoutall", auth(), function (req, res) {
    deps.logoutAll
      .execute(String(req.user!._id))
      .then(() => {
        res.status(200).send("Logout successful");
      })
      .catch(() => {
        res.status(400).send("Invalid user data");
      });
  });

  router.post(
    "/change_password",
    auth(),
    validateBody(changePasswordBodySchema),
    function (req, res) {
    deps.changePassword
      .execute(req.user!, (req.body as ChangePasswordBody).password)
      .then((resp) => {
        switch (resp.status) {
          case 200:
            res.status(resp.status).send(resp.message);
            break;
          case 400:
            res.status(resp.status).send(resp.message);
            break;
          default:
            if ("detail" in resp && resp.detail) {
              sendStoreDetailError(resp.detail, req, res);
            } else {
              res.status(resp.status).send(resp.message);
            }
            break;
        }
      })
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  router.post(
    "/add_company",
    auth(),
    validateBody(addCompanyBodySchema),
    function (req, res) {
    const b = req.body as AddCompanyBody;
    deps.addCompany
      .execute(b.user, b.company)
      .then((resp) => {
        switch (resp.status) {
          case 200:
            res.status(resp.status).send(resp.message);
            break;
          case 400:
            res.status(resp.status).send(resp.message);
            break;
          default:
            sendUserOutcomeWithDetail(res, req, resp);
            break;
        }
      })
      .catch((e: unknown) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
  );

  return router;
}
