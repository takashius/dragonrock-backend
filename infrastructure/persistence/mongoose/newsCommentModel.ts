import mongoose from "mongoose";

const { Schema } = mongoose;

const newsCommentSchema = new Schema(
  {
    news: {
      type: Schema.ObjectId,
      ref: "News",
      required: [true, "A valid news id is required to create a comment."],
      index: true,
    },
    authorName: {
      type: String,
      required: [true, "Please enter a display name."],
      trim: true,
      maxlength: 80,
    },
    body: {
      type: String,
      required: [true, "Please enter a comment."],
      trim: true,
      maxlength: 2000,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

newsCommentSchema.index({ news: 1, active: 1, createdAt: -1 });

const NewsComment = mongoose.model("NewsComment", newsCommentSchema);
export default NewsComment;
