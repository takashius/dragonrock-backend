import News from "./model.js";

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

export async function getPaginateNews(filter, page, company) {
  try {
    const limit = 20;
    let query = { active: true, company: company };
    let queryOr = null;
    let totalNews = 0;
    let result = null;
    queryOr = [
      { title: { "$regex": filter, "$options": "i" } }
    ];
    const select = "id title description content type status image tags created";
    result = await News.find(query)
      .select(select)
      .or(queryOr)
      .populate({
        path: "created.user",
        select: ["name", "lastname"],
        model: "User",
      })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ "created.date": 'desc' });
    totalNews = await News.countDocuments(query);
    const totalPages = Math.ceil(totalNews / limit);
    const next = () => {
      if (totalPages > page) {
        return parseInt(page) + 1;
      } else {
        return null;
      }
    }
    return {
      status: 200,
      message: {
        results: result,
        totalNews,
        totalPages,
        currentPage: page,
        next: next(),
      }
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