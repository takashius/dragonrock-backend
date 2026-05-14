import type { Router } from "express";
import config from "../config.js";
import { MongooseUserRepository } from "../infrastructure/persistence/mongooseUserRepository.js";
import { JwtAccessTokenVerifier } from "../infrastructure/auth/jwtAccessTokenVerifier.js";
import { MailjetMailSender } from "../infrastructure/email/mailjetMailSender.js";
import { MongooseCompanyLookup } from "../infrastructure/company/mongooseCompanyLookup.js";
import {
  createAuthMiddleware,
  type AuthMiddlewareFactory,
} from "../presentation/http/authMiddlewareFactory.js";
import { AuthenticateUserUseCase } from "../application/user/authenticateUserUseCase.js";
import { ListUsersUseCase } from "../application/user/listUsersUseCase.js";
import { GetUserUseCase } from "../application/user/getUserUseCase.js";
import { AddUserUseCase } from "../application/user/addUserUseCase.js";
import { DeleteUserUseCase } from "../application/user/deleteUserUseCase.js";
import { UpdateUserUseCase } from "../application/user/updateUserUseCase.js";
import { LoginUserUseCase } from "../application/user/loginUserUseCase.js";
import { LogoutUserUseCase } from "../application/user/logoutUserUseCase.js";
import { LogoutAllUseCase } from "../application/user/logoutAllUseCase.js";
import { ChangePasswordUseCase } from "../application/user/changePasswordUseCase.js";
import { AddCompanyUseCase } from "../application/user/addCompanyUseCase.js";
import { RemoveCompanyUseCase } from "../application/user/removeCompanyUseCase.js";
import { SelectCompanyUseCase } from "../application/user/selectCompanyUseCase.js";
import { RecoveryStepOneUseCase } from "../application/user/recoveryStepOneUseCase.js";
import { RecoveryStepTwoUseCase } from "../application/user/recoveryStepTwoUseCase.js";
import { RegisterUserPublicUseCase } from "../application/user/registerUserPublicUseCase.js";
import { createUserRouter } from "../presentation/http/userRouter.js";

/**
 * Cableado HTTP del módulo de usuario: repos, JWT, mail, casos de uso y router.
 * Sin lógica de negocio (solo composición).
 */
export function wireUserHttpStack(): {
  auth: AuthMiddlewareFactory;
  userRouter: Router;
} {
  const jwtKey = config.JWT_KEY;
  if (!jwtKey) {
    throw new Error("JWT_KEY debe estar definido en el entorno");
  }
  const userRepository = new MongooseUserRepository();
  const accessTokenVerifier = new JwtAccessTokenVerifier(
    jwtKey,
    config.jwtExposeAuthErrors
  );
  const authenticateUser = new AuthenticateUserUseCase(
    accessTokenVerifier,
    userRepository
  );
  const auth = createAuthMiddleware(authenticateUser);

  const mailSender = new MailjetMailSender();
  const companyLookup = new MongooseCompanyLookup();
  const defaultCompanyId = config.companyDefault ?? "";

  const userRouter = createUserRouter({
    auth,
    listUsers: new ListUsersUseCase(userRepository),
    getUser: new GetUserUseCase(userRepository),
    addUser: new AddUserUseCase(userRepository),
    deleteUser: new DeleteUserUseCase(userRepository),
    updateUser: new UpdateUserUseCase(userRepository),
    loginUser: new LoginUserUseCase(userRepository),
    logoutUser: new LogoutUserUseCase(userRepository),
    logoutAll: new LogoutAllUseCase(userRepository),
    changePassword: new ChangePasswordUseCase(userRepository),
    addCompany: new AddCompanyUseCase(userRepository),
    removeCompany: new RemoveCompanyUseCase(userRepository),
    selectCompany: new SelectCompanyUseCase(userRepository),
    recoveryStepOne: new RecoveryStepOneUseCase(
      userRepository,
      companyLookup,
      mailSender,
      defaultCompanyId
    ),
    recoveryStepTwo: new RecoveryStepTwoUseCase(
      userRepository,
      companyLookup,
      mailSender,
      defaultCompanyId
    ),
    registerUserPublic: new RegisterUserPublicUseCase(
      userRepository,
      companyLookup,
      mailSender,
      defaultCompanyId
    ),
  });

  return { auth, userRouter };
}
