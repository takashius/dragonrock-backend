import mongoose from "mongoose";
import News from "./mongoose/newsModel.js";
import Entrepreneurship from "./mongoose/entrepreneurshipModel.js";
import LiveEvent from "./mongoose/liveEventModel.js";
import Multimedia from "./mongoose/multimediaModel.js";
import Service from "./mongoose/serviceModel.js";
import StoreCategory from "./mongoose/storeCategoryModel.js";
import StoreProduct from "./mongoose/storeProductModel.js";
import type { DashboardRepository } from "../../application/ports/dashboardRepository.js";
import type {
  DashboardOutcome,
  DashboardOutOfStockProduct,
  DashboardPayload,
  DashboardRecentItem,
} from "../../application/types/dashboardOutcome.js";

const baseQuery = (companyId: string) => ({
  active: true,
  company: companyId,
});

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return new Date().toISOString();
}

function mapRecentRows(
  rows: Array<{
    _id: mongoose.Types.ObjectId;
    title?: string;
    name?: string;
    businessName?: string;
    status?: string;
    created?: { date?: Date };
  }>,
  module: DashboardRecentItem["module"],
  titleField: "title" | "name" | "businessName"
): DashboardRecentItem[] {
  return rows.map((row) => ({
    id: String(row._id),
    module,
    title: String(row[titleField] ?? "").trim() || "Sin título",
    status: typeof row.status === "string" ? row.status : null,
    date: toIsoDate(row.created?.date),
  }));
}

async function countByStatuses(
  model: { countDocuments: (filter?: object) => Promise<number> },
  companyId: string,
  inactiveStatus?: string
): Promise<{
  total: number;
  draft: number;
  published: number;
  inactive: number;
}> {
  const query = baseQuery(companyId);
  const [total, draft, published, inactive] = await Promise.all([
    model.countDocuments(query),
    model.countDocuments({ ...query, status: "draft" }),
    model.countDocuments({ ...query, status: "published" }),
    inactiveStatus
      ? model.countDocuments({ ...query, status: inactiveStatus })
      : Promise.resolve(0),
  ]);
  return { total, draft, published, inactive };
}

export class MongooseDashboardRepository implements DashboardRepository {
  async getSummary(
    companyId: string,
    options: { recentItemsLimit: number; outOfStockLimit: number }
  ): Promise<DashboardOutcome> {
    try {
      const query = baseQuery(companyId);
      const perModuleLimit = Math.max(
        options.recentItemsLimit,
        Math.ceil(options.recentItemsLimit / 2)
      );

      const [
        newsCounts,
        entrepreneurshipCounts,
        multimediaCounts,
        servicesCounts,
        liveEventTotal,
        liveEventUpcoming,
        liveEventOngoing,
        liveEventFinished,
        liveEventCancelled,
        storeCategoryTotal,
        storeCategoryActive,
        storeCategoryInactive,
        storeProductTotal,
        storeProductActive,
        storeProductInactive,
        storeProductOutOfStock,
        outOfStockRows,
        newsRecent,
        entrepreneurshipRecent,
        liveEventsRecent,
        multimediaRecent,
        servicesRecent,
        storeCategoriesRecent,
        storeProductsRecent,
      ] = await Promise.all([
        countByStatuses(News, companyId, "archived"),
        countByStatuses(Entrepreneurship, companyId),
        countByStatuses(Multimedia, companyId),
        countByStatuses(Service, companyId),
        LiveEvent.countDocuments(query),
        LiveEvent.countDocuments({ ...query, status: "upcoming" }),
        LiveEvent.countDocuments({ ...query, status: "ongoing" }),
        LiveEvent.countDocuments({ ...query, status: "finished" }),
        LiveEvent.countDocuments({ ...query, status: "cancelled" }),
        StoreCategory.countDocuments(query),
        StoreCategory.countDocuments({ ...query, status: "activa" }),
        StoreCategory.countDocuments({ ...query, status: "inactiva" }),
        StoreProduct.countDocuments(query),
        StoreProduct.countDocuments({ ...query, status: "activo" }),
        StoreProduct.countDocuments({ ...query, status: "inactivo" }),
        StoreProduct.countDocuments({ ...query, status: "agotado" }),
        StoreProduct.aggregate([
          {
            $match: {
              active: true,
              company: new mongoose.Types.ObjectId(companyId),
              status: "agotado",
            },
          },
          {
            $addFields: {
              lastActivityDate: {
                $ifNull: [{ $max: "$history.date" }, "$created.date"],
              },
            },
          },
          { $sort: { lastActivityDate: -1 } },
          { $limit: options.outOfStockLimit },
          {
            $project: {
              name: 1,
              status: 1,
              stock: 1,
              history: 1,
              created: 1,
              lastActivityDate: 1,
            },
          },
        ]),
        News.find(query)
          .select("title status created")
          .sort({ "created.date": -1 })
          .limit(perModuleLimit)
          .lean(),
        Entrepreneurship.find(query)
          .select("businessName status created")
          .sort({ "created.date": -1 })
          .limit(perModuleLimit)
          .lean(),
        LiveEvent.find(query)
          .select("name status created")
          .sort({ "created.date": -1 })
          .limit(perModuleLimit)
          .lean(),
        Multimedia.find(query)
          .select("title status created")
          .sort({ "created.date": -1 })
          .limit(perModuleLimit)
          .lean(),
        Service.find(query)
          .select("name status created")
          .sort({ "created.date": -1 })
          .limit(perModuleLimit)
          .lean(),
        StoreCategory.find(query)
          .select("name status created")
          .sort({ "created.date": -1 })
          .limit(perModuleLimit)
          .lean(),
        StoreProduct.find(query)
          .select("name status created")
          .sort({ "created.date": -1 })
          .limit(perModuleLimit)
          .lean(),
      ]);

      const recentlyOutOfStockProducts: DashboardOutOfStockProduct[] =
        outOfStockRows.map((row) => ({
          id: String(row._id),
          title: String(row.name ?? "").trim() || "Sin título",
          status: "agotado",
          stock: typeof row.stock === "number" ? row.stock : 0,
          date: toIsoDate(row.lastActivityDate ?? row.created?.date),
        }));

      const recentItems = [
        ...mapRecentRows(newsRecent, "news", "title"),
        ...mapRecentRows(
          entrepreneurshipRecent,
          "entrepreneurship",
          "businessName"
        ),
        ...mapRecentRows(liveEventsRecent, "liveEvents", "name"),
        ...mapRecentRows(multimediaRecent, "multimedia", "title"),
        ...mapRecentRows(servicesRecent, "services", "name"),
        ...mapRecentRows(storeCategoriesRecent, "storeCategory", "name"),
        ...mapRecentRows(storeProductsRecent, "storeProduct", "name"),
      ]
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, options.recentItemsLimit);

      const payload: DashboardPayload = {
        recentlyOutOfStockProducts,
        recentItems,
        totals: {
          news: newsCounts,
          entrepreneurship: entrepreneurshipCounts,
          liveEvents: {
            total: liveEventTotal,
            upcoming: liveEventUpcoming,
            ongoing: liveEventOngoing,
            finished: liveEventFinished,
            cancelled: liveEventCancelled,
          },
          multimedia: multimediaCounts,
          services: servicesCounts,
          storeCategories: {
            total: storeCategoryTotal,
            active: storeCategoryActive,
            inactive: storeCategoryInactive,
          },
          storeProducts: {
            total: storeProductTotal,
            active: storeProductActive,
            inactive: storeProductInactive,
            outOfStock: storeProductOutOfStock,
          },
        },
      };

      return { status: 200, message: payload };
    } catch (e) {
      console.log("[ERROR] -> getDashboard", e);
      return { status: 400, message: "Results error", detail: e };
    }
  }
}
