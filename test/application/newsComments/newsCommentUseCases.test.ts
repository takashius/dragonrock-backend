import test from "node:test";
import assert from "node:assert/strict";
import type { NewsRepository } from "../../../application/ports/newsRepository.js";
import type { NewsCommentRepository } from "../../../application/ports/newsCommentRepository.js";
import type { CaptchaVerifier } from "../../../application/ports/captchaVerifier.js";
import type { NewsOutcome } from "../../../application/types/newsOutcome.js";
import type { NewsCommentOutcome } from "../../../application/types/newsCommentOutcome.js";
import { ListPublishedNewsCommentsUseCase } from "../../../application/newsComments/listPublishedNewsCommentsUseCase.js";
import { CreatePublicNewsCommentUseCase } from "../../../application/newsComments/createPublicNewsCommentUseCase.js";
import { DeleteNewsCommentUseCase } from "../../../application/newsComments/deleteNewsCommentUseCase.js";
import { sanitizeNewsCommentText } from "../../../application/newsComments/sanitizeNewsCommentText.js";

const okNews: NewsOutcome = { status: 200, message: { _id: "nid" } };
const okComments: NewsCommentOutcome = {
  status: 200,
  message: [
    {
      _id: "507f1f77bcf86cd799439011",
      authorName: "Carlos",
      body: "Gran artículo",
      createdAt: "2026-09-01T12:00:00.000Z",
    },
  ],
};

function createNewsRepo(
  overrides: Partial<NewsRepository> = {}
): NewsRepository {
  return {
    listPublished: async () => okNews,
    getPublishedDetail: async () => okNews,
    listFirstForCompany: async () => okNews,
    getDetail: async () => okNews,
    create: async () => okNews,
    update: async () => okNews,
    softDelete: async () => okNews,
    paginate: async () => okNews,
    ...overrides,
  };
}

function createCommentsRepo(
  overrides: Partial<NewsCommentRepository> = {}
): NewsCommentRepository {
  return {
    listPublishedByNews: async () => okComments,
    create: async () => ({
      status: 200,
      message: {
        _id: "507f1f77bcf86cd799439012",
        authorName: "Luna",
        body: "Compartido",
        createdAt: "2026-09-01T12:00:00.000Z",
      },
    }),
    softDelete: async () => ({
      status: 200,
      message: "Comment deleted successfully",
    }),
    ...overrides,
  };
}

test("sanitizeNewsCommentText: quita HTML y colapsa espacios", () => {
  assert.equal(
    sanitizeNewsCommentText("  Hola <b>mundo</b>  "),
    "Hola mundo"
  );
});

test("ListPublishedNewsCommentsUseCase: 404 si la noticia no está publicada", async () => {
  const uc = new ListPublishedNewsCommentsUseCase(
    createNewsRepo({
      async getPublishedDetail() {
        return { status: 404, message: "News not found or not published" };
      },
    }),
    createCommentsRepo()
  );
  const out = await uc.execute("507f1f77bcf86cd799439011");
  assert.equal(out.status, 404);
});

test("ListPublishedNewsCommentsUseCase: lista si la noticia está publicada", async () => {
  let seen = "";
  const uc = new ListPublishedNewsCommentsUseCase(
    createNewsRepo(),
    createCommentsRepo({
      async listPublishedByNews(newsId) {
        seen = newsId;
        return okComments;
      },
    })
  );
  const out = await uc.execute("507f1f77bcf86cd799439011");
  assert.equal(seen, "507f1f77bcf86cd799439011");
  assert.equal(out.status, 200);
});

test("CreatePublicNewsCommentUseCase: exige captcha cuando está habilitado", async () => {
  const uc = new CreatePublicNewsCommentUseCase(
    createNewsRepo(),
    createCommentsRepo(),
    { async verify() { return { ok: true }; } },
    true
  );
  const out = await uc.execute({
    newsId: "507f1f77bcf86cd799439011",
    name: "Carlos",
    body: "Gran artículo",
  });
  assert.equal(out.status, 400);
  assert.equal(out.message, "Captcha is required");
});

test("CreatePublicNewsCommentUseCase: rechaza captcha inválido", async () => {
  const captcha: CaptchaVerifier = {
    async verify() {
      return { ok: false, message: "Captcha verification failed" };
    },
  };
  const uc = new CreatePublicNewsCommentUseCase(
    createNewsRepo(),
    createCommentsRepo(),
    captcha,
    true
  );
  const out = await uc.execute({
    newsId: "507f1f77bcf86cd799439011",
    name: "Carlos",
    body: "Gran artículo",
    captchaToken: "bad-token",
  });
  assert.equal(out.status, 400);
  assert.equal(out.message, "Captcha verification failed");
});

test("CreatePublicNewsCommentUseCase: crea comentario si captcha y noticia son válidos", async () => {
  let createdName = "";
  const uc = new CreatePublicNewsCommentUseCase(
    createNewsRepo(),
    createCommentsRepo({
      async create(record) {
        createdName = record.authorName;
        return {
          status: 200,
          message: {
            _id: "507f1f77bcf86cd799439012",
            authorName: record.authorName,
            body: record.body,
            createdAt: "2026-09-01T12:00:00.000Z",
          },
        };
      },
    }),
    { async verify() { return { ok: true }; } },
    true
  );
  const out = await uc.execute({
    newsId: "507f1f77bcf86cd799439011",
    name: "  Carlos <b>M</b>  ",
    body: "Gran artículo",
    captchaToken: "ok-token",
  });
  assert.equal(out.status, 200);
  assert.equal(createdName, "Carlos M");
});

test("CreatePublicNewsCommentUseCase: sin captcha si no es obligatorio", async () => {
  const uc = new CreatePublicNewsCommentUseCase(
    createNewsRepo(),
    createCommentsRepo(),
    undefined,
    false
  );
  const out = await uc.execute({
    newsId: "507f1f77bcf86cd799439011",
    name: "Luna",
    body: "Compartido",
  });
  assert.equal(out.status, 200);
});

test("CreatePublicNewsCommentUseCase: no crea si la noticia no está publicada", async () => {
  let created = false;
  const uc = new CreatePublicNewsCommentUseCase(
    createNewsRepo({
      async getPublishedDetail() {
        return { status: 404, message: "News not found or not published" };
      },
    }),
    createCommentsRepo({
      async create() {
        created = true;
        return okComments;
      },
    }),
    undefined,
    false
  );
  const out = await uc.execute({
    newsId: "507f1f77bcf86cd799439011",
    name: "Luna",
    body: "Compartido",
  });
  assert.equal(out.status, 404);
  assert.equal(created, false);
});

test("DeleteNewsCommentUseCase: delega en el repositorio", async () => {
  let commentId = "";
  let companyId = "";
  const uc = new DeleteNewsCommentUseCase(
    createCommentsRepo({
      async softDelete(id, company) {
        commentId = id;
        companyId = company;
        return { status: 200, message: "Comment deleted successfully" };
      },
    })
  );
  const out = await uc.execute("cid", "coid");
  assert.equal(commentId, "cid");
  assert.equal(companyId, "coid");
  assert.equal(out.status, 200);
});
