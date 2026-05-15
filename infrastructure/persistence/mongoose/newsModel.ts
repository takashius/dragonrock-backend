import mongoose from "mongoose";

const { Schema } = mongoose;

const newsSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please enter a news title."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ["escenaRock", "culturales", "other"],
    required: [true, "Please enter a news type."],
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    required: [true, "Please enter a news status."],
    default: "draft",
  },
  image: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    index: true,
    lowercase: true,
    trim: true,
  },
  created: {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "A valid user is required to create a company."],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  history: [
    {
      user: {
        type: Schema.ObjectId,
        ref: "User",
        required: [true, "A valid user is required for change history."],
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  company: {
    type: Schema.ObjectId,
    ref: "Company",
    required: [true, "A valid company is required to create a product."],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const News = mongoose.model("News", newsSchema);
export default News;
