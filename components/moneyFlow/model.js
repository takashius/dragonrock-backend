import mongoose from "mongoose";
const Schema = mongoose.Schema;

const moneyFlowSchema = Schema({
  title: {
    type: String,
    required: [true, "Please enter a title for flow."],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Please enter a amount."],
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: [true, "Please specify the type of flow (income or expense)."]
  },
  category: {
    type: Schema.ObjectId,
    ref: "Category",
    required: [true, "A valid category is required."]
  },
  cotiza: {
    type: Schema.ObjectId,
    ref: "Cotizaciones",
    required: [false]
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
    required: [true, "A valid company is required to create a client."],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const categorySchema = Schema({
  name: {
    type: String,
    required: [true, "Please enter a name for the category."],
    trim: true,
  },
  company: {
    type: Schema.ObjectId,
    ref: "Company",
    required: [true, "A valid company is required to create a category."],
  },
  active: {
    type: Boolean,
    default: true,
  },
});


const MoneyFlow = mongoose.model("MoneyFlow", moneyFlowSchema);
const Category = mongoose.model("Category", categorySchema);
export { MoneyFlow, Category };
