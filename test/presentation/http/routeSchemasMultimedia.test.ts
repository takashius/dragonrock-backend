import test from "node:test";
import assert from "node:assert/strict";
import {
  createMultimediaBodySchema,
  updateMultimediaBodySchema,
} from "../../../presentation/http/schemas/routeSchemasMultimedia.js";

test("createMultimediaBodySchema: video válido", () => {
  const parsed = createMultimediaBodySchema.safeParse({
    title: "Entrevista",
    type: "video",
    status: "draft",
    date: "2026-05-27",
    videoUrl: "https://youtube.com/watch?v=abc",
  });
  assert.equal(parsed.success, true);
});

test("createMultimediaBodySchema: video sin videoUrl falla", () => {
  const parsed = createMultimediaBodySchema.safeParse({
    title: "Entrevista",
    type: "video",
    status: "draft",
    date: "2026-05-27",
  });
  assert.equal(parsed.success, false);
});

test("createMultimediaBodySchema: podcast requiere season, episode y podcastUrl", () => {
  const parsed = createMultimediaBodySchema.safeParse({
    title: "Podcast",
    type: "podcast",
    status: "draft",
    date: "2026-05-27",
    season: 2,
    episode: 45,
    podcastUrl: "https://open.spotify.com/episode/abc",
  });
  assert.equal(parsed.success, true);
});

test("createMultimediaBodySchema: gallery requiere galleryImages", () => {
  const fail = createMultimediaBodySchema.safeParse({
    title: "Galería",
    type: "gallery",
    status: "draft",
    date: "2026-05-27",
  });
  assert.equal(fail.success, false);

  const ok = createMultimediaBodySchema.safeParse({
    title: "Galería",
    type: "gallery",
    status: "draft",
    date: "2026-05-27",
    galleryImages: ["data:image/png;base64,AAAA"],
  });
  assert.equal(ok.success, true);
});

test("updateMultimediaBodySchema: id inválido falla", () => {
  const parsed = updateMultimediaBodySchema.safeParse({
    id: "bad-id",
    title: "Nuevo título",
  });
  assert.equal(parsed.success, false);
});
