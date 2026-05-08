import type { Express } from "express";
import config from "../config.js";
import { MongooseNewsRepository } from "../infrastructure/persistence/mongooseNewsRepository.js";
import { MongooseUserRepository } from "../infrastructure/persistence/mongooseUserRepository.js";
import { JwtAccessTokenVerifier } from "../infrastructure/auth/jwtAccessTokenVerifier.js";
import { MailjetMailSender } from "../infrastructure/email/mailjetMailSender.js";
import { MongooseCompanyLookup } from "../infrastructure/company/mongooseCompanyLookup.js";
import { ListNewsUseCase } from "../application/news/listNewsUseCase.js";
import { GetNewsDetailUseCase } from "../application/news/getNewsDetailUseCase.js";
import { PaginateNewsUseCase } from "../application/news/paginateNewsUseCase.js";
import { CreateNewsUseCase } from "../application/news/createNewsUseCase.js";
import { UpdateNewsUseCase } from "../application/news/updateNewsUseCase.js";
import { DeleteNewsUseCase } from "../application/news/deleteNewsUseCase.js";
import { createNewsRouter } from "../presentation/http/newsRouter.js";
import { createAuthMiddleware } from "../presentation/http/authMiddlewareFactory.js";
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

/** Prefijo global de la API (vacío = raíz). */
const API_PREFIX = "";

function buildAuthAndUserWiring() {
  const jwtKey = config.JWT_KEY;
  if (!jwtKey) {
    throw new Error("JWT_KEY debe estar definido en el entorno");
  }
  const userRepository = new MongooseUserRepository();
  const accessTokenVerifier = new JwtAccessTokenVerifier(jwtKey);
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

function buildNewsRouter(auth: ReturnType<typeof createAuthMiddleware>) {
  const newsRepository = new MongooseNewsRepository();
  return createNewsRouter({
    auth,
    listNews: new ListNewsUseCase(newsRepository),
    getNewsDetail: new GetNewsDetailUseCase(newsRepository),
    paginateNews: new PaginateNewsUseCase(newsRepository),
    createNews: new CreateNewsUseCase(newsRepository),
    updateNews: new UpdateNewsUseCase(newsRepository),
    deleteNews: new DeleteNewsUseCase(newsRepository),
  });
}

/**
 * Punto único donde se montan las rutas HTTP.
 * Usuario y noticias: casos de uso + adaptadores cableados aquí.
 */
export function registerRoutes(app: Express): void {
  const { auth, userRouter } = buildAuthAndUserWiring();
  app.use(`${API_PREFIX}/user`, userRouter);
  app.use(`${API_PREFIX}/news`, buildNewsRouter(auth));
}
