import test from "node:test";
import assert from "node:assert/strict";
import type { EntrepreneurshipRepository } from "../../../application/ports/entrepreneurshipRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { CreateEntrepreneurshipUseCase } from "../../../application/entrepreneurship/createEntrepreneurshipUseCase.js";
import { UpdateEntrepreneurshipUseCase } from "../../../application/entrepreneurship/updateEntrepreneurshipUseCase.js";

test("CreateEntrepreneurshipUseCase: sube featuredImage y guarda URL", async () => {
  let storedData: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      storedData = data;
      return { status: 200, message: data };
    },
  } as unknown as EntrepreneurshipRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/entrepreneurship/e1",
        secureUrl:
          "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/entrepreneurship/e1.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new CreateEntrepreneurshipUseCase(repo, media).execute(
    {
      entrepreneurName: "María",
      businessName: "Rock",
      category: "Moda",
      status: "draft",
      introduction: "<p>Intro</p>",
      questions: [{ question: "Q", answer: "<p>A</p>" }],
      featuredImage: "data:image/png;base64,AAAA",
    },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(
    storedData?.featuredImage,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/entrepreneurship/e1.jpg"
  );
});

test("CreateEntrepreneurshipUseCase: featuredImage sin Cloudinary retorna 503", async () => {
  const out = await new CreateEntrepreneurshipUseCase(
    {} as EntrepreneurshipRepository
  ).execute(
    {
      entrepreneurName: "María",
      businessName: "Rock",
      category: "Moda",
      status: "draft",
      introduction: "<p>Intro</p>",
      questions: [{ question: "Q", answer: "<p>A</p>" }],
      featuredImage: "data:image/png;base64,AAAA",
    },
    "u1",
    "c1"
  );
  assert.equal(out.status, 503);
});

test("CreateEntrepreneurshipUseCase: ignora featuredImage placeholder string", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as EntrepreneurshipRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
  } as MediaStorage;

  const out = await new CreateEntrepreneurshipUseCase(repo, media).execute(
    {
      entrepreneurName: "María",
      businessName: "Rock",
      category: "Moda",
      status: "draft",
      introduction: "<p>Intro</p>",
      questions: [{ question: "Q", answer: "<p>A</p>" }],
      featuredImage: "string",
    },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(stored?.featuredImage, undefined);
});

test("UpdateEntrepreneurshipUseCase: ignora featuredImage placeholder string", async () => {
  let updatePayload: unknown;
  const repo = {
    async update(
      data: { id: string } & Record<string, unknown>,
      _companyId: string,
      _editorUserId: string
    ) {
      updatePayload = data;
      return { status: 200, message: "ok" };
    },
  } as unknown as EntrepreneurshipRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
  } as MediaStorage;

  const out = await new UpdateEntrepreneurshipUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      entrepreneurName: "María",
      featuredImage: "string",
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal("featuredImage" in (updatePayload as object), false);
});

test("UpdateEntrepreneurshipUseCase: reemplaza featuredImage y borra previa", async () => {
  let updatePayload: unknown;
  let deleted = "";
  const repo = {
    async getDetail() {
      return {
        status: 200,
        message: {
          featuredImage:
            "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/entrepreneurship/old.jpg",
        },
      };
    },
    async update(
      data: { id: string } & Record<string, unknown>,
      _companyId: string,
      _editorUserId: string
    ) {
      updatePayload = data;
      return { status: 200, message: "ok" };
    },
  } as unknown as EntrepreneurshipRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/entrepreneurship/new",
        secureUrl:
          "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/entrepreneurship/new.jpg",
        resourceType: "image",
      };
    },
    async destroyByUrl(url: string) {
      deleted = url;
      return { publicId: "dragonrock/entrepreneurship/old", result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateEntrepreneurshipUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      featuredImage: "data:image/png;base64,BBBB",
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal(
    (updatePayload as { featuredImage?: string }).featuredImage,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/entrepreneurship/new.jpg"
  );
  assert.equal(
    deleted,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/entrepreneurship/old.jpg"
  );
});
