import { Document, ObjectId, type Types } from "mongoose";
import { ITimesheet } from "./timesheet";

export interface IShift extends Document {
  agentId?: ObjectId | string;
  homeId: ObjectId;
  isAccepted: boolean;
  isRejected: boolean;
  date: string;
  isCompleted: boolean;
  shiftType: any;
  count: number;
  assignedUsers: Types.ObjectId[];
  privateKey?: string;
  signedCarers?: {
    [carerId: string]: string;
  };
  timesheet?: ITimesheet;
  createdAt?: Date;
  updatedAt?: Date;
}
