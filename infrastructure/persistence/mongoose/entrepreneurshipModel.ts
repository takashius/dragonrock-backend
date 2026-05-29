import mongoose from "mongoose";

const { Schema } = mongoose;

const interviewQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, "Interview question is required."],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Interview answer is required."],
      trim: true,
    },
  },
  { _id: false }
);

const entrepreneurshipSchema = new Schema({
  entrepreneurName: {
    type: String,
    required: [true, "Entrepreneur name is required."],
    trim: true,
  },
  businessName: {
    type: String,
    required: [true, "Business name is required."],
    trim: true,
  },
  role: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Category is required."],
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    required: [true, "Status is required."],
    default: "draft",
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  featuredImage: {
    type: String,
    trim: true,
  },
  featuredQuote: {
    type: String,
    trim: true,
  },
  introduction: {
    type: String,
    required: [true, "Introduction is required."],
    trim: true,
  },
  questions: {
    type: [interviewQuestionSchema],
    validate: {
      validator: (v: unknown[]) => Array.isArray(v) && v.length > 0,
      message: "At least one interview question is required.",
    },
  },
  keyLearnings: {
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

const Entrepreneurship = mongoose.model(
  "Entrepreneurship",
  entrepreneurshipSchema
);
export default Entrepreneurship;
