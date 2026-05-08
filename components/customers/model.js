import mongoose from "mongoose";
import validator from "validator";
const Schema = mongoose.Schema;

const customerSchema = Schema({
  title: {
    type: String,
    required: [true, "Please enter a title for client."],
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Please enter the name of the person responsible."],
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  rif: {
    type: String,
    required: [true, "Please enter the identification number."],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Enter an email address."],
    validate: [validator.isEmail, "Enter a valid email address."]
  },
  phone: {
    type: String,
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
  company: {
    type: Schema.ObjectId,
    ref: "Company",
    required: [true, "A valid company is required to create a client."],
  },
  addresses: [
    {
      title: {
        type: String,
        required: [true, "Please enter the title for address."],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "Please enter the city for address."],
        trim: true,
      },
      line1: {
        type: String,
        required: [true, "Please enter the address."],
        trim: true,
      },
      line2: {
        type: String,
        trim: true,
      },
      zip: {
        type: String,
        trim: true,
      },
      default: {
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

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
