import test from "node:test";
import assert from "node:assert/strict";
import type { MediaStorage } from "../../../application/ports/mediaStorage.js";
import { UploadMediaUseCase } from "../../../application/media/uploadMediaUseCase.js";
import { DeleteMediaUseCase } from "../../../application/media/deleteMediaUseCase.js";

function createStorage(overrides: Partial<MediaStorage> = {}): MediaStorage {
  return {
    async upload() {
      return {
        publicId: "folder/a",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
        resourceType: "image",
      };
    },
    async destroy() {
      return {
        publicId: "folder/a",
        result: "ok",
      };
    },
    ...overrides,
  } as MediaStorage;
}

test("UploadMediaUseCase: valida source obligatorio", async () => {
  const uc = new UploadMediaUseCase(createStorage());
  const out = await uc.execute({ source: "" });
  assert.equal(out.status, 400);
});

test("UploadMediaUseCase: delega upload al puerto", async () => {
  let payload: unknown;
  const uc = new UploadMediaUseCase(
    createStorage({
      async upload(input) {
        payload = input;
        return {
          publicId: "dragonrock/news/img-1",
          secureUrl: "https://cdn.example/img-1.jpg",
          resourceType: "image",
          width: 400,
          height: 200,
        };
      },
    })
  );

  const out = await uc.execute({
    source: "data:image/png;base64,AAAA",
    folder: "dragonrock/news",
    publicId: "img-1",
    resourceType: "image",
  });

  assert.equal(out.status, 200);
  assert.deepEqual(payload, {
    source: "data:image/png;base64,AAAA",
    folder: "dragonrock/news",
    publicId: "img-1",
    resourceType: "image",
  });
});

test("DeleteMediaUseCase: valida publicId obligatorio", async () => {
  const uc = new DeleteMediaUseCase(createStorage());
  const out = await uc.execute({ publicId: "" });
  assert.equal(out.status, 400);
});

test("DeleteMediaUseCase: delega destroy al puerto", async () => {
  let payload: unknown;
  const uc = new DeleteMediaUseCase(
    createStorage({
      async destroy(input) {
        payload = input;
        return {
          publicId: input.publicId,
          result: "ok",
        };
      },
    })
  );

  const out = await uc.execute({
    publicId: "dragonrock/news/img-1",
    resourceType: "image",
  });

  assert.equal(out.status, 200);
  assert.deepEqual(payload, {
    publicId: "dragonrock/news/img-1",
    resourceType: "image",
  });
});
