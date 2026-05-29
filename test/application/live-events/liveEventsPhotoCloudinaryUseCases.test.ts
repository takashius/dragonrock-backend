import test from "node:test";
import assert from "node:assert/strict";
import type { LiveEventRepository } from "../../../application/ports/liveEventRepository.js";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { CreateLiveEventUseCase } from "../../../application/live-events/createLiveEventUseCase.js";
import { UpdateLiveEventUseCase } from "../../../application/live-events/updateLiveEventUseCase.js";

const basePayload = {
  name: "Rock al Parque",
  type: "concierto" as const,
  status: "upcoming" as const,
  date: "2026-07-01",
  time: "18:00",
  place: "Bogotá",
};

test("CreateLiveEventUseCase: sube image y guarda URL", async () => {
  let storedData: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      storedData = data;
      return { status: 200, message: data };
    },
  } as unknown as LiveEventRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/live-events/e1",
        secureUrl:
          "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/live-events/e1.jpg",
        resourceType: "image",
      };
    },
  } as MediaStorage;

  const out = await new CreateLiveEventUseCase(repo, media).execute(
    { ...basePayload, image: "data:image/png;base64,AAAA" },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(
    storedData?.image,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/live-events/e1.jpg"
  );
});

test("CreateLiveEventUseCase: image sin Cloudinary retorna 503", async () => {
  const out = await new CreateLiveEventUseCase(
    {} as LiveEventRepository
  ).execute(
    { ...basePayload, image: "data:image/png;base64,AAAA" },
    "u1",
    "c1"
  );
  assert.equal(out.status, 503);
});

test("CreateLiveEventUseCase: ignora image placeholder string", async () => {
  let stored: Record<string, unknown> | undefined;
  const repo = {
    async create(data: Record<string, unknown>) {
      stored = data;
      return { status: 200, message: data };
    },
  } as unknown as LiveEventRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
  } as MediaStorage;

  const out = await new CreateLiveEventUseCase(repo, media).execute(
    { ...basePayload, image: "string" },
    "u1",
    "c1"
  );

  assert.equal(out.status, 200);
  assert.equal(stored?.image, undefined);
});

test("UpdateLiveEventUseCase: reemplaza image y borra previa", async () => {
  let updatePayload: unknown;
  let deleted = "";
  const repo = {
    async getDetail() {
      return {
        status: 200,
        message: {
          image:
            "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/live-events/old.jpg",
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
  } as unknown as LiveEventRepository;
  const media = {
    async upload() {
      return {
        publicId: "dragonrock/live-events/new",
        secureUrl:
          "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/live-events/new.jpg",
        resourceType: "image",
      };
    },
    async destroyByUrl(url: string) {
      deleted = url;
      return { publicId: "dragonrock/live-events/old", result: "ok" };
    },
  } as MediaStorage;

  const out = await new UpdateLiveEventUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      image: "data:image/png;base64,BBBB",
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal(
    (updatePayload as { image?: string }).image,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/live-events/new.jpg"
  );
  assert.equal(
    deleted,
    "https://res.cloudinary.com/erdesarrollo/image/upload/v1/dragonrock/live-events/old.jpg"
  );
});

test("UpdateLiveEventUseCase: ignora image placeholder string", async () => {
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
  } as unknown as LiveEventRepository;
  const media = {
    async upload() {
      throw new Error("no debería subir");
    },
  } as MediaStorage;

  const out = await new UpdateLiveEventUseCase(repo, media).execute(
    {
      id: "507f1f77bcf86cd799439011",
      name: "Rock al Parque",
      image: "string",
    },
    "c1",
    "u-editor"
  );

  assert.equal(out.status, 200);
  assert.equal("image" in (updatePayload as object), false);
});

test("UpdateLiveEventUseCase: date sin time retorna 400", async () => {
  const out = await new UpdateLiveEventUseCase(
    {} as LiveEventRepository
  ).execute(
    {
      id: "507f1f77bcf86cd799439011",
      date: "2026-07-01",
    },
    "c1",
    "u-editor"
  );
  assert.equal(out.status, 400);
});
