import mongoose from "mongoose";

const { Schema } = mongoose;

const serviceSchema = new Schema({
  name: {
    type: String,
    required: [true, "Service name is required."],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, "Slug is required."],
    trim: true,
    lowercase: true,
  },
  category: {
    type: String,
    enum: [
      "desarrolloWeb",
      "disenoGrafico",
      "marketingDigital",
      "personalizacion",
      "produccionMusical",
      "fotografia",
      "otro",
    ],
    required: [true, "Category is required."],
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    required: [true, "Status is required."],
    default: "draft",
  },
  price: {
    type: Number,
    min: 0,
  },
  showPriceFrom: {
    type: Boolean,
    default: false,
  },
  shortDescription: {
    type: String,
    required: [true, "Short description is required."],
    trim: true,
    maxlength: 200,
  },
  fullDescription: {
    type: String,
    trim: true,
  },
  featuredImage: {
    type: String,
    trim: true,
  },
  contactUrl: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isFeatured: {
    type: Boolean,
    default: false,
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

const Service = mongoose.model("Service", serviceSchema);
export default Service;
