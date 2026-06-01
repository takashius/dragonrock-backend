import type { PublicHomeOutcome } from "../types/publicHomeOutcome.js";

export interface PublicHomeRepository {
  getHome(): Promise<PublicHomeOutcome>;
}
