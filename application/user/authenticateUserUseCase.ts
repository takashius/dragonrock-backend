import type { Types } from "mongoose";
import type { AccessTokenVerifier } from "../ports/accessTokenVerifier.js";
import type { UserRepository } from "../ports/userRepository.js";
import type { AuthUserPayload } from "../../types/auth.js";

export type AuthenticateUserSuccess = {
  ok: true;
  user: AuthUserPayload;
  token: string;
};

export type AuthenticateUserFailure = {
  ok: false;
  errorMessage: string;
};

export type AuthenticateUserResult = AuthenticateUserSuccess | AuthenticateUserFailure;

type UserDoc = {
  _id: Types.ObjectId;
  name: string;
  lastname?: string;
  email: string;
  phone?: string;
  companys: { selected: boolean; company: Types.ObjectId }[];
};

function isUserDoc(u: unknown): u is UserDoc {
  if (typeof u !== "object" || u === null) {
    return false;
  }
  const o = u as Record<string, unknown>;
  return (
    o._id != null &&
    typeof o.name === "string" &&
    typeof o.email === "string" &&
    Array.isArray(o.companys)
  );
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly verifier: AccessTokenVerifier,
    private readonly users: UserRepository
  ) {}

  async execute(token: string): Promise<AuthenticateUserResult> {
    const trimmed = token.trim();
    if (!trimmed) {
      return {
        ok: false,
        errorMessage:
          "Not authorized to access this resource - Authorization header missing",
      };
    }

    const verified = this.verifier.verify(trimmed);
    if (!verified.ok) {
      const base = "Not authorized to access this resource";
      const errorMessage = verified.jwtMessage
        ? `${base} - ${verified.jwtMessage}`
        : base;
      return { ok: false, errorMessage };
    }

    const raw = await this.users.findActiveUserWithToken(
      verified.userId,
      trimmed
    );
    if (!raw || !isUserDoc(raw)) {
      return {
        ok: false,
        errorMessage: "Not authorized to access this resource",
      };
    }

    const selectedCompanies = raw.companys.filter((item) => item.selected);
    const selectedCompanyId = selectedCompanies[0]?.company;
    if (!selectedCompanyId) {
      return {
        ok: false,
        errorMessage:
          "Not authorized to access this resource - No company selected",
      };
    }

    const user: AuthUserPayload = {
      _id: raw._id,
      name: raw.name,
      lastname: raw.lastname,
      email: raw.email,
      phone: raw.phone,
      company: selectedCompanyId,
    };

    return { ok: true, user, token: trimmed };
  }
}
