import mongoose from "mongoose";

const { Schema } = mongoose;

const storeCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Category name is required."],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, "Slug is required."],
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  featuredImage: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["activa", "inactiva"],
    required: [true, "Status is required."],
    default: "activa",
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

const StoreCategory = mongoose.model("StoreCategory", storeCategorySchema);
export default StoreCategory;
