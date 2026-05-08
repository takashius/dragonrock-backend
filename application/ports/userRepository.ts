import type {
  RecoveryStepOneResult,
  RecoveryStepTwoResult,
  UserOutcome,
} from "../types/userOutcome.js";

export interface UserRepository {
  findActiveUserWithToken(
    userId: string,
    token: string
  ): Promise<unknown | null>;

  getUser(userId: string | null): Promise<UserOutcome>;
  getUsers(companyId: string | null): Promise<UserOutcome>;
  addUser(user: Record<string, unknown>): Promise<UserOutcome>;
  registerUserPublic(request: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    docId: string;
  }): Promise<UserOutcome>;
  updateUser(user: {
    id: string;
    name?: string;
    lastname?: string;
    photo?: string;
    phone?: string;
    password?: string;
  }): Promise<UserOutcome>;
  deleteUser(id: string): Promise<UserOutcome>;
  loginUser(mail: string, pass: string): Promise<UserOutcome>;
  logoutUser(id: string, tokenUser: string): Promise<void>;
  logoutAll(id: string): Promise<void>;
  changePassword(
    user: { email: string },
    newPass: string
  ): Promise<UserOutcome>;
  addCompany(userId: string, company: string): Promise<UserOutcome>;
  removeCompany(userId: string, company: string): Promise<UserOutcome>;
  selectCompany(userId: string, company: string): Promise<UserOutcome>;
  recoveryStepOne(
    email: string,
    code: string
  ): Promise<RecoveryStepOneResult>;
  recoveryStepTwo(
    email: string,
    code: string,
    newPass: string
  ): Promise<RecoveryStepTwoResult>;
}
