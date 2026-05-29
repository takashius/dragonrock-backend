import mongoose from "mongoose";

const { Schema } = mongoose;

const multimediaSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required."],
    trim: true,
  },
  type: {
    type: String,
    enum: ["video", "podcast", "gallery"],
    required: [true, "Content type is required."],
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    required: [true, "Status is required."],
    default: "draft",
  },
  contentDate: {
    type: Date,
    required: [true, "Content date is required."],
  },
  durationOrQuantity: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  featuredImage: {
    type: String,
    trim: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  season: {
    type: Number,
    min: 0,
  },
  episode: {
    type: Number,
    min: 0,
  },
  podcastUrl: {
    type: String,
    trim: true,
  },
  galleryImages: {
    type: [String],
    default: [],
  },
  created: {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "A valid user is required."],
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
    required: [true, "A valid company is required."],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const Multimedia = mongoose.model("Multimedia", multimediaSchema);
export default Multimedia;
