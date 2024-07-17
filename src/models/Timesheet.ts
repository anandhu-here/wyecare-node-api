import { Schema, model, Types } from "mongoose";
import { ITimesheet } from "../interfaces/entities/timesheet";
import { ShiftSchema } from "./Shift";

const TimesheetSchema = new Schema<ITimesheet>(
  {
    shiftId: {
      type: Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    carerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    homeId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

TimesheetSchema.virtual("shift", {
  ref: "Shift",
  localField: "shiftId",
  foreignField: "_id",
  justOne: true,
});

const TimesheetModel = model<ITimesheet>("Timesheet", TimesheetSchema);

export default TimesheetModel;
