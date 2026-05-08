import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config.js";
const Schema = mongoose.Schema;

const userSchema = Schema({
  name: {
    type: String,
    required: [true, "Please enter your first name."],
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Enter an email address."],
    validate: [validator.isEmail, "Enter a valid email address."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Missing password."],
    minLength: [7, "Your password must contain at least 8 characters"],
  },
  recovery: [
    {
      code: String,
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  companys: [
    {
      company: {
        type: Schema.ObjectId,
        ref: "Company",
        required: [true, "A valid company is required."],
      },
      selected: {
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

userSchema.pre("save", async function (next) {
  // Hash the password before saving the user model
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  // Generate an auth token for the user
  const user = this;
  const objToken = {
    _id: user._id,
    date: new Date(),
  };
  const token = jwt.sign(objToken, config.JWT_KEY, {
    expiresIn: config.jwtExpiresIn,
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const credentialError = "Invalid login credentials";
  if (!validator.isEmail(email)) {
    throw new Error(credentialError);
  }
  const user = await User.findOne({ email, active: true }).select("-__v");

  if (!user) {
    throw new Error(credentialError);
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error(credentialError);
  }
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
