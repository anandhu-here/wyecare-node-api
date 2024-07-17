import type { Document, Schema } from "mongoose";
import type { IAuthTokenModel } from "./authToken";
import type { ICompany } from "./company";

export interface IAvatar {
  publicId: string;
  url: string;
}

export interface ILinkedUser {
  accountType?:
    | "carer"
    | "agency"
    | "nurse"
    | "home"
    | "admin"
    | "superadmin"
    | "user"
    | "guest"
    | "unknown";
  users: Schema.Types.ObjectId[];
}
export interface IAccountVerification {
  isVerified: boolean;
  category: string;
  verifiedAt: Date;
  lastRequestedAt?: Date;
}
export interface IAvailableTimings {
  dates: string[];
}

export interface IUser {
  fname: string;
  lname: string;
  nameChangedAt?: Date;
  email: string;
  company?: ICompany;
  availabilities: IAvailableTimings;
  accountType?:
    | "carer"
    | "agency"
    | "nurse"
    | "home"
    | "admin"
    | "superadmin"
    | "user"
    | "guest"
    | "unknown";
  linkedUsers?: ILinkedUser[];
  isEmailVerified?: boolean;
  emailChangedAt?: Date;
  countryCode?: string;
  phone?: string;
  isPhoneVerified?: boolean;
  phoneChangedAt?: Date;
  avatar?: IAvatar;
  website?: string;
  isPrivate?: boolean;
  accountStatus?: string;
  verification?: IAccountVerification;
}

export interface IUserModel extends IUser, Document {
  password?: string;
  passwordChangedAt?: Date;
  salt: string;

  postsCount: number;
  followersCount: number;
  followingCount: number;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  generateToken(): Promise<IAuthTokenModel>;
  getToken(refreshToken?: boolean): Promise<IAuthTokenModel>;
  isProfileComplete(): Promise<boolean>;
  setPassword(password: string): Promise<void>;
  matchPassword(password: string): Promise<boolean>;
}
