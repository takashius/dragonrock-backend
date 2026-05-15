import test from "node:test";
import assert from "node:assert/strict";
import type { NewsRepository } from "../../../application/ports/newsRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { CreateNewsUseCase } from "../../../application/news/createNewsUseCase.js";
import { UpdateNewsUseCase } from "../../../application/news/updateNewsUseCase.js";

test("CreateNewsUseCase: sube image y guarda URL", async () => {
  let storedData: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      storedData = data;
      return { status: 200, message: data };
    },
  } as unknown as NewsRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/news/n1",
        secureUrl:
          "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/news/n1.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new CreateNewsUseCase(repo, media).execute(
    {
      title: "Noticia",
      type: "other",
      status: "draft",
      image: "data:image/png;base64,AAAA",
    },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(
    storedData?.image,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/news/n1.jpg"
  );
});

test("CreateNewsUseCase: si hay image y no cloudinary configurado retorna 503", async () => {
  const out = await new CreateNewsUseCase({} as NewsRepository).execute(
    {
      title: "Noticia",
      type: "other",
      status: "draft",
      image: "data:image/png;base64,AAAA",
    },
    "u1",
    "c1"
  );
  assert.equal(out.status, 503);
});

test("UpdateNewsUseCase: sube nueva image, delega editor y borra previa", async () => {
  let updatePayload: unknown;
  let updateEditor = "";
  let deleted = "";
  const repo = {
    async getDetail() {
      return {
        status: 200,
        message: {
          image:
            "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/news/old.jpg",
        },
      };
    },
    async update(
      data: { id: string } & Record<string, unknown>,
      _companyId: string,
      editorUserId: string
    ) {
      updatePayload = data;
      updateEditor = editorUserId;
      return { status: 200, message: "ok" };
    },
  } as unknown as NewsRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/news/new",
        secureUrl:
          "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/news/new.jpg",
        resourceType: "image",
      };
    },
    async destroyByUrl(url: string) {
      deleted = url;
      return { publicId: "dragonrock/news/old", result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateNewsUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      image: "data:image/png;base64,BBBB",
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal(updateEditor, "u-editor");
  assert.equal(
    (updatePayload as { image?: string }).image,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/news/new.jpg"
  );
  assert.equal(
    deleted,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/news/old.jpg"
  );
});

test("UpdateNewsUseCase: si hay image y no cloudinary configurado retorna 503", async () => {
  const out = await new UpdateNewsUseCase({} as NewsRepository).execute(
    {
      id: "507f1f77bcf86cd799439011",
      image: "data:image/png;base64,CCCC",
    },
    "c1",
    "u-editor"
  );
  assert.equal(out.status, 503);
});
