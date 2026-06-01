/** Resultado del panel administrativo. */
export type DashboardOutcome = {
  status: number;
  message: unknown;
  detail?: unknown;
};

export type DashboardModuleKey =
  | "news"
  | "entrepreneurship"
  | "liveEvents"
  | "multimedia"
  | "services"
  | "storeCategory"
  | "storeProduct";

export type DashboardRecentItem = {
  id: string;
  module: DashboardModuleKey;
  title: string;
  status: string | null;
  date: string;
};

export type DashboardOutOfStockProduct = {
  id: string;
  title: string;
  status: "agotado";
  stock: number;
  date: string;
};

export type DashboardContentCounts = {
  total: number;
  draft: number;
  published: number;
  inactive: number;
};

export type DashboardLiveEventCounts = {
  total: number;
  upcoming: number;
  ongoing: number;
  finished: number;
  cancelled: number;
};

export type DashboardStoreCategoryCounts = {
  total: number;
  active: number;
  inactive: number;
};

export type DashboardStoreProductCounts = {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
};

export type DashboardPayload = {
  recentlyOutOfStockProducts: DashboardOutOfStockProduct[];
  recentItems: DashboardRecentItem[];
  totals: {
    news: DashboardContentCounts;
    entrepreneurship: DashboardContentCounts;
    liveEvents: DashboardLiveEventCounts;
    multimedia: DashboardContentCounts;
    services: DashboardContentCounts;
    storeCategories: DashboardStoreCategoryCounts;
    storeProducts: DashboardStoreProductCounts;
  };
};
