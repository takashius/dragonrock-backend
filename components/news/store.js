import News from "./model.js";

/** Caracteres especiales de regex escapados para búsqueda literal segura */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getNews(id, company) {
  try {
    let query = { active: true, company: company  };
    if (id) {
      query._id = id;
    }

    const result = await News.findOne(query);
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getNews", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getNewsDetail(id, company) {
  try {
    if (!id?.trim()) {
      return { status: 400, message: "News id is required" };
    }
    const result = await News.findOne({
      _id: id,
      active: true,
      company,
    }).populate({
      path: "created.user",
      select: ["name", "lastname"],
      model: "User",
    });
    if (!result) {
      return { status: 404, message: "News not found" };
    }
    return { status: 200, message: result };
  } catch (e) {
    if (e.name === "CastError") {
      return { status: 400, message: "Invalid news id" };
    }
    console.log("[ERROR] -> getNewsDetail", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getPaginateNews(filter, page, company) {
  try {
    const limit = 20;
    const searchText =
      filter === undefined || filter === null
        ? ""
        : String(filter).trim();

    const query = { active: true, company };
    if (searchText) {
      query.title = {
        $regex: escapeRegex(searchText),
        $options: "i",
      };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    const select =
      "id title description content type status image tags created";
    const result = await News.find(query)
      .select(select)
      .populate({
        path: "created.user",
        select: ["name", "lastname"],
        model: "User",
      })
      .limit(limit)
      .skip((pageNum - 1) * limit)
      .sort({ "created.date": "desc" });
    const totalNews = await News.countDocuments(query);
    const totalPages = Math.ceil(totalNews / limit);
    const next = () => {
      if (totalPages > pageNum) {
        return pageNum + 1;
      }
      return null;
    };
    return {
      status: 200,
      message: {
        results: result,
        totalNews,
        totalPages,
        currentPage: pageNum,
        next: next(),
      },
    };
  } catch (e) {
    console.log("[ERROR] -> getPaginateNews", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function addNews(data, user, company) {
  try {
        const newsData = {
      title: data.title,
      description: data.description,
      content: data.content,
      type: data.type,
      status: data.status,
      image: data.image,
      tags: data.tags,
      company,
      created: {
        user,
      },
    };
    const news = new News(newsData);
    const result = await news.save();
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> addNews", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function updateNews(data, company) {
  try {
    const foundNews = await News.findOne({ _id: data.id, company: company });
    if (!foundNews) {
      return {
        status: 400,
        message: "News not found",
      };
    }
    if (data.title) {
      foundNews.title = data.title;
    }
    if (data.description) {
      foundNews.description = data.description;
    }
    if (data.content) {
      foundNews.content = data.content;
    }
    if (data.type) {
      foundNews.type = data.type;
    }
    if (data.status) {
      foundNews.status = data.status;
    }
    if (data.image) {
      foundNews.image = data.image;
    }
    if (data.tags) {
      foundNews.tags = data.tags;
    }
    await foundNews.save();
    return {
      status: 200,
      message: foundNews,
    };
  } catch (e) {
    console.log("[ERROR] -> updateNews", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function deleteNews(id, company) {
  try {
    const foundNews = await News.findOne({ _id: id, company: company });
    if (!foundNews) {
      return {
        status: 400,
        message: "News not found",
      };
    }
    foundNews.active = false;
    foundNews.save();
    return {
      status: 200,
      message: "News deleted successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> deleteNews", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}