/** Resultado de operaciones de comentarios de noticias. */
export type NewsCommentOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type PublicNewsCommentDto = {
  _id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type CreatePublicNewsCommentInput = {
  newsId: string;
  name: string;
  body: string;
  captchaToken?: string;
  remoteIp?: string;
};
