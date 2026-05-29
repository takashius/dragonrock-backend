import mongoose from "mongoose";

const { Schema } = mongoose;

const liveEventSchema = new Schema({
  name: {
    type: String,
    required: [true, "Event name is required."],
    trim: true,
  },
  type: {
    type: String,
    enum: ["concierto", "festival", "cultural", "otro"],
    required: [true, "Event type is required."],
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "finished", "cancelled"],
    required: [true, "Event status is required."],
    default: "upcoming",
  },
  eventDate: {
    type: Date,
    required: [true, "Event date is required."],
  },
  place: {
    type: String,
    required: [true, "Place is required."],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180,
  },
  price: {
    type: Number,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
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

const LiveEvent = mongoose.model("LiveEvent", liveEventSchema);
export default LiveEvent;
