import News from "./mongoose/newsModel.js";
import LiveEvent from "./mongoose/liveEventModel.js";
import Entrepreneurship from "./mongoose/entrepreneurshipModel.js";
import StoreProduct from "./mongoose/storeProductModel.js";
import type { PublicHomeRepository } from "../../application/ports/publicHomeRepository.js";
import type {
  PublicHomeOutcome,
  PublicHomePayload,
} from "../../application/types/publicHomeOutcome.js";
import { splitEventDateTime } from "../../application/live-events/mergeEventDateTime.js";

const NEWS_LIMIT = 3;
const LIVE_EVENTS_LIMIT = 4;
const FEATURED_ENTREPRENEURS_LIMIT = 2;
const FEATURED_PRODUCTS_LIMIT = 3;

const newsPublicSelect =
  "title description content type status image tags created";
const liveEventPublicSelect =
  "name type status eventDate place address latitude longitude price description image isFeatured created";
const entrepreneurshipPublicSelect =
  "entrepreneurName businessName role category location website status isFeatured featuredImage featuredQuote introduction questions keyLearnings created";
const productPublicSelect =
  "name slug status price compareAtPrice stock sku description featuredImage galleryImages isFeatured tags category created";

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

export class MongoosePublicHomeRepository implements PublicHomeRepository {
  async getHome(): Promise<PublicHomeOutcome> {
    try {
      const [news, liveEvents, featuredEntrepreneurRows, featuredProductRows] =
        await Promise.all([
          News.find({
            active: true,
            status: "published",
          })
            .select(newsPublicSelect)
            .populate({
              path: "created.user",
              select: ["name", "lastname"],
              model: "User",
            })
            .sort({ "created.date": -1 })
            .limit(NEWS_LIMIT)
            .lean(),
          LiveEvent.find({
            active: true,
            status: { $ne: "cancelled" },
          })
            .select(liveEventPublicSelect)
            .populate({
              path: "created.user",
              select: ["name", "lastname"],
              model: "User",
            })
            .sort({ eventDate: 1 })
            .limit(LIVE_EVENTS_LIMIT)
            .lean(),
          Entrepreneurship.aggregate([
            {
              $match: {
                active: true,
                status: "published",
                isFeatured: true,
              },
            },
            { $sample: { size: FEATURED_ENTREPRENEURS_LIMIT } },
          ]),
          StoreProduct.aggregate([
            {
              $match: {
                active: true,
                status: "activo",
                isFeatured: true,
              },
            },
            { $sample: { size: FEATURED_PRODUCTS_LIMIT } },
          ]),
        ]);

      const entrepreneurIds = featuredEntrepreneurRows.map(
        (row: { _id: unknown }) => row._id
      );
      const featuredEntrepreneurs =
        entrepreneurIds.length > 0
          ? await Entrepreneurship.find({ _id: { $in: entrepreneurIds } })
              .select(entrepreneurshipPublicSelect)
              .populate({
                path: "created.user",
                select: ["name", "lastname"],
                model: "User",
              })
              .lean()
          : [];

      const productIds = featuredProductRows.map(
        (row: { _id: unknown }) => row._id
      );
      const featuredProducts =
        productIds.length > 0
          ? await StoreProduct.find({ _id: { $in: productIds } })
              .select(productPublicSelect)
              .populate({
                path: "category",
                select: ["name", "slug"],
                model: "StoreCategory",
              })
              .lean()
          : [];

      const payload: PublicHomePayload = {
        news,
        liveEvents: enrichLiveEventList(liveEvents),
        featuredEntrepreneurs,
        featuredProducts,
      };

      return { status: 200, message: payload };
    } catch (e) {
      console.log("[ERROR] -> getPublicHome", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
