import type { Document, ObjectId } from "mongoose";

export interface IShiftType extends Document {
  name: string;
  startTime: string;
  endTime: string;
}

export interface IUserShiftType {
  userId: ObjectId | string;
  shifttypes: IShiftType[];
}

export interface IUserShiftTypeModel extends IUserShiftType, Document {
  createdAt: Date;
  updatedAt: Date;
}
