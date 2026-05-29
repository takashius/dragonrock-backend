import Multimedia from "./mongoose/multimediaModel.js";
import type { MultimediaRepository } from "../../application/ports/multimediaRepository.js";
import type { MultimediaOutcome } from "../../application/types/multimediaOutcome.js";
import { formatContentDate } from "../../application/multimedia/parseContentDate.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listSelect =
  "title type status contentDate durationOrQuantity description featuredImage isFeatured videoUrl season episode podcastUrl galleryImages created history";
const publicListSelect =
  "title type status contentDate durationOrQuantity description featuredImage isFeatured videoUrl season episode podcastUrl galleryImages created";

function enrichMultimediaDoc(doc: unknown): unknown {
  if (!doc || typeof doc !== "object") {
    return doc;
  }
  const plain =
    typeof (doc as { toObject?: () => Record<string, unknown> }).toObject ===
    "function"
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(doc as Record<string, unknown>) };
  const contentDate = plain.contentDate;
  if (contentDate instanceof Date) {
    plain.date = formatContentDate(contentDate);
  }
  return plain;
}

function enrichMultimediaList(docs: unknown[]): unknown[] {
  return docs.map((doc) => enrichMultimediaDoc(doc));
}

export class MongooseMultimediaRepository implements MultimediaRepository {
  async listPublished(): Promise<MultimediaOutcome> {
    try {
      const result = await Multimedia.find({
        active: true,
        status: "published",
      })
        .select(publicListSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .sort({ contentDate: -1 });
      return { status: 200, message: enrichMultimediaList(result) };
    } catch (e) {
      console.log("[ERROR] -> listPublishedMultimedia", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getPublishedDetail(id: string): Promise<MultimediaOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Multimedia id is required" };
      }
      const result = await Multimedia.findOne({
        _id: id,
        active: true,
        status: "published",
      })
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .populate({
          path: "history.user",
          select: ["name", "lastname"],
          model: "User",
        });
      if (!result) {
        return {
          status: 404,
          message: "Multimedia not found or not published",
        };
      }
      return { status: 200, message: enrichMultimediaDoc(result) };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid multimedia id" };
      }
      console.log("[ERROR] -> getPublishedMultimediaDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getDetail(id: string, companyId: string): Promise<MultimediaOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Multimedia id is required" };
      }
      const result = await Multimedia.findOne({
        _id: id,
        active: true,
        company: companyId,
      })
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .populate({
          path: "history.user",
          select: ["name", "lastname"],
          model: "User",
        });
      if (!result) {
        return { status: 404, message: "Multimedia not found" };
      }
      return { status: 200, message: enrichMultimediaDoc(result) };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid multimedia id" };
      }
      console.log("[ERROR] -> getMultimediaDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async paginate(params: {
    search?: string;
    filter: unknown;
    type?: unknown;
    status?: unknown;
    page: unknown;
    pageSize?: unknown;
    companyId: string;
  }): Promise<MultimediaOutcome> {
    try {
      const defaultLimit = 20;
      const maxLimit = 100;
      const searchText =
        params.search !== undefined && params.search !== null
          ? String(params.search).trim()
          : params.filter === undefined || params.filter === null
            ? ""
            : String(params.filter).trim();

      const query: Record<string, unknown> = {
        active: true,
        company: params.companyId,
      };

      if (params.type !== undefined && params.type !== null && String(params.type).trim()) {
        query.type = String(params.type).trim();
      }
      if (
        params.status !== undefined &&
        params.status !== null &&
        String(params.status).trim()
      ) {
        query.status = String(params.status).trim();
      }

      if (searchText) {
        const regex = { $regex: escapeRegex(searchText), $options: "i" };
        query.$or = [{ title: regex }, { description: regex }];
      }

      const pageNum = Math.max(1, parseInt(String(params.page), 10) || 1);
      const requestedLimit =
        params.pageSize === undefined || params.pageSize === null
          ? defaultLimit
          : parseInt(String(params.pageSize), 10);
      const limit =
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? Math.min(requestedLimit, maxLimit)
          : defaultLimit;

      const result = await Multimedia.find(query)
        .select(listSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ contentDate: -1 });
      const total = await Multimedia.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const next = (): number | null => {
        if (totalPages > pageNum) {
          return pageNum + 1;
        }
        return null;
      };
      return {
        status: 200,
        message: {
          results: enrichMultimediaList(result),
          totalMultimedia: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> paginateMultimedia", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<MultimediaOutcome> {
    try {
      const doc = new Multimedia({
        title: data.title,
        type: data.type,
        status: data.status,
        contentDate: data.contentDate,
        durationOrQuantity: data.durationOrQuantity,
        description: data.description,
        featuredImage: data.featuredImage,
        isFeatured: data.isFeatured ?? false,
        videoUrl: data.videoUrl,
        season: data.season,
        episode: data.episode,
        podcastUrl: data.podcastUrl,
        galleryImages: data.galleryImages ?? [],
        company: companyId,
        created: { user: userId },
      });
      const result = await doc.save();
      return { status: 200, message: enrichMultimediaDoc(result) };
    } catch (e) {
      console.log("[ERROR] -> createMultimedia", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<MultimediaOutcome> {
    try {
      const found = await Multimedia.findOne({
        _id: data.id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Multimedia not found" };
      }
      if (data.title !== undefined) {
        found.title = data.title as string;
      }
      if (data.type !== undefined) {
        found.type = data.type as "video" | "podcast" | "gallery";
      }
      if (data.status !== undefined) {
        found.status = data.status as "draft" | "published";
      }
      if (data.contentDate !== undefined) {
        found.contentDate = data.contentDate as Date;
      }
      if (data.durationOrQuantity !== undefined) {
        found.durationOrQuantity = data.durationOrQuantity as string;
      }
      if (data.description !== undefined) {
        found.description = data.description as string;
      }
      if (data.featuredImage !== undefined) {
        found.featuredImage = data.featuredImage as string;
      }
      if (data.isFeatured !== undefined) {
        found.isFeatured = Boolean(data.isFeatured);
      }
      if (data.videoUrl !== undefined) {
        found.videoUrl = data.videoUrl as string;
      }
      if (data.season !== undefined) {
        found.season = data.season as number;
      }
      if (data.episode !== undefined) {
        found.episode = data.episode as number;
      }
      if (data.podcastUrl !== undefined) {
        found.podcastUrl = data.podcastUrl as string;
      }
      if (data.galleryImages !== undefined) {
        found.galleryImages = data.galleryImages as string[];
      }
      if (data.clearGallery === true) {
        found.galleryImages = [];
      }
      if (data.clearVideoUrl === true) {
        found.videoUrl = undefined;
      }
      if (data.clearPodcast === true) {
        found.season = undefined;
        found.episode = undefined;
        found.podcastUrl = undefined;
      }
      found.history = found.history.concat({
        user: editorUserId as unknown as import("mongoose").Types.ObjectId,
        date: new Date(),
      });
      await found.save();
      return { status: 200, message: enrichMultimediaDoc(found) };
    } catch (e) {
      console.log("[ERROR] -> updateMultimedia", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<MultimediaOutcome> {
    try {
      const found = await Multimedia.findOne({
        _id: id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Multimedia not found" };
      }
      found.active = false;
      await found.save();
      return {
        status: 200,
        message: {
          text: "Multimedia deleted successfully",
          featuredImage: found.featuredImage,
          galleryImages: found.galleryImages ?? [],
        },
      };
    } catch (e) {
      console.log("[ERROR] -> deleteMultimedia", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
