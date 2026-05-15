import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../../../config.js";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter your first name."],
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ["Administrador", "Editor", "Autor"],
    default: "Autor",
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

userSchema.pre("save", async function (this: mongoose.Document) {
  const user = this as mongoose.Document & {
    password: string;
    isModified: (p: string) => boolean;
  };
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

userSchema.methods.generateAuthToken = async function (this: mongoose.Document) {
  const user = this as mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    tokens: { token: string; date: Date }[];
    save: () => Promise<unknown>;
  };
  const objToken = {
    _id: user._id,
    date: new Date(),
  };
  const token = jwt.sign(
    objToken,
    config.JWT_KEY!,
    { expiresIn: config.jwtExpiresIn } as SignOptions
  );
  user.tokens = user.tokens.concat({ token, date: new Date() });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async function (
  this: mongoose.Model<unknown>,
  email: string,
  password: string
) {
  const credentialError = "Invalid login credentials";
  if (!validator.isEmail(email)) {
    throw new Error(credentialError);
  }
  const user = await this.findOne({ email, active: true }).select("-__v");

  if (!user) {
    throw new Error(credentialError);
  }
  const doc = user as mongoose.Document & { password: string };
  const isPasswordMatch = await bcrypt.compare(password, doc.password);
  if (!isPasswordMatch) {
    throw new Error(credentialError);
  }
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
