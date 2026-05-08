import mongoose from "mongoose";
const Schema = mongoose.Schema;

const cotizaSchema = Schema({
  title: {
    type: String,
    required: [true, "Please enter a title for cotiza."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["open", "close", "done", "cancelled"],
    required: [true, "Please enter the valid status."],
    default: "open",
  },
  number: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
  sequence: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  },
  date: {
    type: "string",
    trim: true,
  },
  created: {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "A valid user is required to create a cotiza."],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  company: {
    type: Schema.ObjectId,
    ref: "Company",
    required: [true, "A valid company is required to create a cotiza."],
  },
  customer: {
    type: Schema.ObjectId,
    ref: "Customer",
    required: [true, "A valid customer is required to create a cotiza."],
  },
  rate: {
    type: Number,
  },
  discount: {
    type: Number,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
  typeDiscount: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  products: [
    {
      master: {
        type: Schema.ObjectId,
        ref: "Product",
        required: [
          true,
          "A valid product is required to create a product in cotiza.",
        ],
      },
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
      amount: {
        type: Number,
        default: 1,
      },
      iva: {
        type: Boolean,
        default: false,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
});

const Cotizaciones = mongoose.model("Cotizaciones", cotizaSchema);
export default Cotizaciones;
