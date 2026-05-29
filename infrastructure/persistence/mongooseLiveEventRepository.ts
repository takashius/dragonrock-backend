import LiveEvent from "./mongoose/liveEventModel.js";
import type { LiveEventRepository } from "../../application/ports/liveEventRepository.js";
import type { LiveEventOutcome } from "../../application/types/liveEventOutcome.js";
import { splitEventDateTime } from "../../application/live-events/mergeEventDateTime.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listSelect =
  "name type status eventDate place address latitude longitude price description image isFeatured created history";
const publicListSelect =
  "name type status eventDate place address latitude longitude price description image isFeatured created";

function enrichLiveEventDoc(doc: unknown): unknown {
  if (!doc || typeof doc !== "object") {
    return doc;
  }
  const plain =
    typeof (doc as { toObject?: () => Record<string, unknown> }).toObject ===
    "function"
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(doc as Record<string, unknown>) };
  const eventDate = plain.eventDate;
  if (eventDate instanceof Date) {
    const { date, time } = splitEventDateTime(eventDate);
    plain.date = date;
    plain.time = time;
  }
  return plain;
}

function enrichLiveEventList(docs: unknown[]): unknown[] {
  return docs.map((doc) => enrichLiveEventDoc(doc));
}

export class MongooseLiveEventRepository implements LiveEventRepository {
  async listPublic(): Promise<LiveEventOutcome> {
    try {
      const result = await LiveEvent.find({
        active: true,
        status: { $ne: "cancelled" },
      })
        .select(publicListSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .sort({ eventDate: 1 });
      return { status: 200, message: enrichLiveEventList(result) };
    } catch (e) {
      console.log("[ERROR] -> listPublicLiveEvents", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getPublicDetail(id: string): Promise<LiveEventOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Live event id is required" };
      }
      const result = await LiveEvent.findOne({
        _id: id,
        active: true,
        status: { $ne: "cancelled" },
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
          message: "Live event not found or not available",
        };
      }
      return { status: 200, message: enrichLiveEventDoc(result) };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid live event id" };
      }
      console.log("[ERROR] -> getPublicLiveEventDetail", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async getDetail(id: string, companyId: string): Promise<LiveEventOutcome> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: "Live event id is required" };
      }
      const result = await LiveEvent.findOne({
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
        return { status: 404, message: "Live event not found" };
      }
      return { status: 200, message: enrichLiveEventDoc(result) };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "CastError") {
        return { status: 400, message: "Invalid live event id" };
      }
      console.log("[ERROR] -> getLiveEventDetail", e);
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
  }): Promise<LiveEventOutcome> {
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
        query.$or = [{ name: regex }, { place: regex }, { address: regex }];
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

      const result = await LiveEvent.find(query)
        .select(listSelect)
        .populate({
          path: "created.user",
          select: ["name", "lastname"],
          model: "User",
        })
        .limit(limit)
        .skip((pageNum - 1) * limit)
        .sort({ eventDate: 1 });
      const total = await LiveEvent.countDocuments(query);
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
          results: enrichLiveEventList(result),
          totalLiveEvents: total,
          totalPages,
          currentPage: pageNum,
          pageSize: limit,
          next: next(),
        },
      };
    } catch (e) {
      console.log("[ERROR] -> paginateLiveEvents", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async create(
    data: Record<string, unknown>,
    userId: string,
    companyId: string
  ): Promise<LiveEventOutcome> {
    try {
      const doc = new LiveEvent({
        name: data.name,
        type: data.type,
        status: data.status,
        eventDate: data.eventDate,
        place: data.place,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        price: data.price,
        description: data.description,
        image: data.image,
        isFeatured: data.isFeatured ?? false,
        company: companyId,
        created: { user: userId },
      });
      const result = await doc.save();
      return { status: 200, message: enrichLiveEventDoc(result) };
    } catch (e) {
      console.log("[ERROR] -> createLiveEvent", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async update(
    data: { id: string } & Record<string, unknown>,
    companyId: string,
    editorUserId: string
  ): Promise<LiveEventOutcome> {
    try {
      const found = await LiveEvent.findOne({
        _id: data.id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Live event not found" };
      }
      if (data.name !== undefined) {
        found.name = data.name as string;
      }
      if (data.type !== undefined) {
        found.type = data.type as
          | "concierto"
          | "festival"
          | "cultural"
          | "otro";
      }
      if (data.status !== undefined) {
        found.status = data.status as
          | "upcoming"
          | "ongoing"
          | "finished"
          | "cancelled";
      }
      if (data.eventDate !== undefined) {
        found.eventDate = data.eventDate as Date;
      }
      if (data.place !== undefined) {
        found.place = data.place as string;
      }
      if (data.address !== undefined) {
        found.address = data.address as string;
      }
      if (data.latitude !== undefined) {
        found.latitude = data.latitude as number | undefined;
      }
      if (data.longitude !== undefined) {
        found.longitude = data.longitude as number | undefined;
      }
      if (data.price !== undefined) {
        found.price = data.price as number;
      }
      if (data.description !== undefined) {
        found.description = data.description as string;
      }
      if (data.image !== undefined) {
        found.image = data.image as string;
      }
      if (data.isFeatured !== undefined) {
        found.isFeatured = Boolean(data.isFeatured);
      }
      found.history = found.history.concat({
        user: editorUserId as unknown as import("mongoose").Types.ObjectId,
        date: new Date(),
      });
      await found.save();
      return { status: 200, message: enrichLiveEventDoc(found) };
    } catch (e) {
      console.log("[ERROR] -> updateLiveEvent", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }

  async softDelete(id: string, companyId: string): Promise<LiveEventOutcome> {
    try {
      const found = await LiveEvent.findOne({
        _id: id,
        company: companyId,
      });
      if (!found) {
        return { status: 400, message: "Live event not found" };
      }
      found.active = false;
      await found.save();
      return { status: 200, message: "Live event deleted successfully" };
    } catch (e) {
      console.log("[ERROR] -> deleteLiveEvent", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
