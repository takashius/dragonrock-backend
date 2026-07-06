import mongoose from "mongoose";
import validator from "validator";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.ObjectId,
      ref: "StoreProduct",
      required: [true, "Product reference is required."],
    },
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required."],
      trim: true,
      lowercase: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required."],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required."],
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: [true, "Line total is required."],
      min: 0,
    },
  },
  { _id: false }
);

const storeOrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: [true, "Order number is required."],
    trim: true,
    unique: true,
  },
  customer: {
    name: {
      type: String,
      required: [true, "Customer name is required."],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Customer email is required."],
      validate: [validator.isEmail, "Enter a valid customer email."],
    },
    phone: {
      type: String,
      required: [true, "Customer phone is required."],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Customer address is required."],
      trim: true,
    },
  },
  items: {
    type: [orderItemSchema],
    validate: [
      (v: unknown[]) => Array.isArray(v) && v.length > 0,
      "Order must include at least one item.",
    ],
  },
  subtotal: {
    type: Number,
    required: [true, "Subtotal is required."],
    min: 0,
  },
  total: {
    type: Number,
    required: [true, "Total is required."],
    min: 0,
  },
  status: {
    type: String,
    enum: ["pendiente", "confirmado", "enviado", "cancelado"],
    default: "pendiente",
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  company: {
    type: Schema.ObjectId,
    ref: "Company",
    required: [true, "A valid company is required."],
  },
  created: {
    date: {
      type: Date,
      default: Date.now,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const StoreOrder = mongoose.model("StoreOrder", storeOrderSchema);
export default StoreOrder;
