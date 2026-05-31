import mongoose from "mongoose";

const { Schema } = mongoose;

const storeProductSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required."],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, "Slug is required."],
    trim: true,
    lowercase: true,
  },
  category: {
    type: Schema.ObjectId,
    ref: "StoreCategory",
    required: [true, "Category is required."],
  },
  status: {
    type: String,
    enum: ["activo", "inactivo", "agotado"],
    required: [true, "Status is required."],
    default: "activo",
  },
  price: {
    type: Number,
    required: [true, "Price is required."],
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: [true, "Stock is required."],
    min: 0,
    default: 0,
  },
  sku: {
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
  galleryImages: {
    type: [String],
    default: [],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  tags: {
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

const StoreProduct = mongoose.model("StoreProduct", storeProductSchema);
export default StoreProduct;
