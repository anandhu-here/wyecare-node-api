import { Schema, Types, model } from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { IAuthTokenModel } from "../interfaces/entities/authToken";
import type { IUserModel } from "../interfaces/entities/user";
import { EUserStatus } from "../enums";
import LocalConfig from "../configs/LocalConfig";
import StringValues from "../constants/strings";
import Logger from "../logger";
import AuthToken from "./AuthToken";
import TokenServiceHelper from "../helpers/TokenServiceHelper";

const AvailableTimingsSchema = new Schema({
  dates: [String],
});

const companySchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return v.length <= 100;
      },
      msg: "Company name length should not be greater than 100 characters",
    },
  },
  address: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return v.length <= 100;
      },
      msg: "Company address length should not be greater than 100 characters",
    },
  },
  phone: {
    type: String,
    validate: {
      validator: function (v: string) {
        return v.length === 10;
      },
      msg: "Company phone number length should be equal to 10 characters",
    },
  },
  email: {
    type: String,
    validate: {
      validator: function (v: string) {
        return v.length <= 100;
      },
      msg: "Company email length should not be greater than 100 characters",
    },
  },
  website: {
    type: String,
    validate: {
      validator: function (v: string) {
        return v.length <= 100;
      },
      msg: "Company website length should not be greater than 100 characters",
    },
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
});

const UserSchema = new Schema<IUserModel>(
  {
    fname: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return v.length <= 100;
        },
        msg: "First name length should not be greater than 100 characters",
      },
    },

    lname: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return v.length <= 100;
        },
        msg: "Last name length should not be greater than 100 characters",
      },
    },
    company: companySchema,
    availabilities: AvailableTimingsSchema,
    accountType: {
      type: String,
      enum: [
        "carer",
        "nurse",
        "senior-carer",
        "agency",
        "home",
        "admin",
        "superadmin",
        "user",
        "guest",
        "unknown",
      ],
      default: "user",
    },

    nameChangedAt: { type: Date },

    email: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return v.length <= 100;
        },
        msg: "Email length should not be greater than 100 characters",
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    linkedUsers: {
      type: [
        {
          accountType: {
            type: String,
            enum: [
              "agency",
              "agent",
              "home",
              "carer",
              "nurse",
              "admin",
              "superadmin",
              "user",
              "guest",
              "unknown",
            ],
            required: true,
          },
          users: [
            {
              type: Types.ObjectId,
              ref: "User",
            },
          ],
        },
      ],
      default: [],
    },

    emailChangedAt: { type: Date },

    countryCode: {
      type: String,
      maxlength: 20,
    },

    phone: {
      type: String,
      validate: {
        validator: function (v: string) {
          return v.length === 10;
        },
        msg: "Phone number length should be equal to 10 characters",
      },
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    phoneChangedAt: { type: Date },

    password: {
      type: String,
      maxlength: 1000,
    },

    passwordChangedAt: { type: Date },

    salt: {
      type: String,
      maxlength: 1000,
    },

    avatar: {
      publicId: {
        type: String,
        maxlength: 100,
      },
      url: {
        type: String,
        maxlength: 500,
      },
    },

    website: {
      type: String,
      maxlength: 100,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    accountStatus: {
      type: String,
      enum: EUserStatus,
      default: EUserStatus.active,
    },

    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },

      category: {
        type: String,
        maxlength: 100,
      },

      verifiedAt: { type: Date },

      lastRequestedAt: { type: Date },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/**
 * @name generateToken
 * @description Generate user's auth token
 * @returns Promise<IAuthTokenModel>
 */
UserSchema.methods.generateToken = async function (): Promise<IAuthTokenModel> {
  const jwtSecret = LocalConfig.getConfig().JWT_SECRET!;
  const jwtExpiresIn = LocalConfig.getConfig().JWT_EXPIRES_IN! || 2592000000;

  if (!jwtSecret) throw new Error(StringValues.JWT_SECRET_NOT_FOUND);

  const token = jwt.sign({ id: this._id }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  if (!token) {
    Logger.error(`JwtError :: An error occurred while creating JwtToken`);
    throw new Error(StringValues.JWT_TOKEN_CREATE_ERROR);
  }

  const decodedData = jwt.decode(token);

  if (!decodedData || typeof decodedData === "string") {
    Logger.error(`JwtError :: An error occurred while decoding JwtToken`);
    throw new Error(StringValues.JWT_TOKEN_CREATE_ERROR);
  }

  const authToken = await AuthToken.create({
    token: token,
    userId: this._id,
    expiresAt: decodedData.exp,
  });

  if (!authToken) {
    Logger.error(`AuthToken :: An error occurred while creating AuthToken`);
    throw new Error(StringValues.JWT_TOKEN_CREATE_ERROR);
  }

  Logger.info(`AuthToken :: created`);
  return authToken;
};

/**
 * @name getToken
 * @description Get user's auth token
 * @returns Promise<IAuthTokenModel>
 */
UserSchema.methods.getToken = async function (
  refreshToken = false
): Promise<IAuthTokenModel> {
  if (refreshToken) {
    await AuthToken.deleteOne({ userId: this._id });

    const newToken = await this.generateToken();
    return newToken;
  }

  const authToken = await AuthToken.findOne({ userId: this._id });

  if (!authToken) {
    const newToken = await this.generateToken();
    return newToken;
  }

  const isExpired = await TokenServiceHelper.isTokenExpired(
    authToken.expiresAt
  );

  if (isExpired) {
    await AuthToken.deleteOne({ userId: this._id });

    const newToken = await this.generateToken();
    return newToken;
  }

  return authToken;
};

UserSchema.methods.checkToken = async function (
  token: string
): Promise<string> {
  const jwtSecret = LocalConfig.getConfig().JWT_SECRET!;

  if (!jwtSecret) throw new Error(StringValues.JWT_SECRET_NOT_FOUND);
  const decodedData = jwt.verify(token, jwtSecret) as { id: string };

  if (!decodedData || typeof decodedData === "string") {
    Logger.error(`JwtError :: An error occurred while verifying JwtToken`);
    throw new Error(StringValues.JWT_TOKEN_INVALID);
  }

  const authToken = await AuthToken.findOne({
    token: token,
    userId: decodedData.id,
  });

  if (!authToken) {
    Logger.error(`AuthToken :: Token not found`);
    throw new Error(StringValues.JWT_TOKEN_INVALID);
  }

  const user = await User.findById(decodedData.id).lean();

  if (!user) {
    Logger.error(`User :: User not found`);
    throw new Error(StringValues.USER_NOT_FOUND);
  }

  Logger.info(`AuthToken :: Token verified`);
  return user.email;
};

/**
 * @name isProfileComplete
 * @description Check if user's profile is complete
 * @returns Promise<boolean>
 */
UserSchema.methods.isProfileComplete = async function (): Promise<boolean> {
  if (!this.fullName) return false;

  if (!this.email) return false;

  return true;
};

/**
 * @name matchPassword
 * @description Set user's password
 * @returns Promise<boolean>
 */
UserSchema.methods.setPassword = async function (
  password: string
): Promise<void> {
  const _currentDateTime = new Date(Date.now());

  // Creating a unique salt for a particular user
  this.salt = crypto.randomBytes(16).toString("hex");

  // Hashing user's salt and password with 1000 iterations,
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  this.passwordChangedAt = _currentDateTime;

  await this.save();
};

/**
 * @name matchPassword
 * @description Check if user's password is correct
 * @returns Promise<boolean>
 */
UserSchema.methods.matchPassword = async function (
  password: string
): Promise<boolean> {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);

  return this.password === hash;
};

UserSchema.index({ fname: "text", lname: "text", email: "text" });
const User = model<IUserModel>("User", UserSchema);

export default User;
