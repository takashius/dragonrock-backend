import mongoose from "mongoose";
const Schema = mongoose.Schema;

const protuctSchema = Schema({
  name: {
    type: String,
    required: [true, "Please enter a product name."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please enter a price of product."],
  },
  iva: {
    type: Boolean,
    default: true,
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

const Product = mongoose.model("Product", protuctSchema);
export default Product;
