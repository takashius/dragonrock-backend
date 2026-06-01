/** Resultado del home público. */
export type PublicHomeOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type PublicHomePayload = {
  news: unknown[];
  liveEvents: unknown[];
  featuredEntrepreneurs: unknown[];
  featuredProducts: unknown[];
};
