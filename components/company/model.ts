import mongoose from "mongoose";
import validator from "validator";
const { Schema } = mongoose;

const companySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter a company name."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Enter an email address."],
    validate: [validator.isEmail, "Enter a valid email address."],
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  rif: {
    type: String,
    required: [true, "Please enter a RIF number."],
    trim: true,
    unique: true,
  },
  address: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    trim: true,
  },
  logoAlpha: {
    type: String,
    trim: true,
  },
  banner: {
    type: String,
    trim: true,
  },
  iva: {
    type: Number,
    default: 16,
  },
  correlatives: {
    manageInvoiceCorrelative: {
      type: Boolean,
      default: true,
    },
    invoice: {
      type: Number,
      default: 0
    }
  },
  currencySymbol: {
    type: String,
    trim: true,
    default: "$",
  },
  currencyRate: {
    type: String,
    trim: true,
    default: "$",
  },
  configMail: {
    colors: {
      primary: {
        type: String,
        trim: true,
        default: "#008080",
      },
      secundary: {
        type: String,
        trim: true,
        default: "#8CF7FC",
      },
      background: {
        type: String,
        trim: true,
        default: "#2a2a2a",
      },
      title: {
        type: String,
        trim: true,
        default: "#ffffff",
      },
    },
    textBody: {
      type: String,
      trim: true,
      default: `
      Este correo es para confirmar su presupuesto #{cotizaNumber} con {CompanyName} para que pueda revisarlo y decidir si se ajusta a sus necesidades.
      {br} {br}
      Si tienes alguna duda o pregunta sobre su presupuesto escríbenos a {emailCompany}
      `
    }
  },
  configPdf: {
    language: {
      type: String,
      enum: ["es", "en"],
      default: "es",
    },
    logo: {
      x: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
        default: 28,
      },
      y: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
        default: 20,
      },
      width: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
        default: 100,
      },
    },
    logoAlpha: {
      x: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
        default: 80,
      },
      y: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
        default: 400,
      },
      width: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
        default: 400,
      },
    },
    footer: {
      show: {
        type: Boolean,
        default: true,
      },
      text: {
        type: String,
        trim: true,
      },
    }
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
  active: {
    type: Boolean,
    default: true,
  },
});

const Company = mongoose.model("Company", companySchema);
export default Company;
