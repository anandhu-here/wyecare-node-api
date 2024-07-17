import { model, Schema, Types } from "mongoose";
import type { IShift } from "src/interfaces/entities/shift";
import { ShiftTypeSchema } from "./ShiftType";

export const ShiftSchema: Schema = new Schema<IShift>(
  {
    agentId: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
      default: undefined,
    },
    homeId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
    },
    assignedUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    privateKey: { type: String, required: false },
    signedCarers: { type: Object, default: {} },
    shiftType: {
      type: ShiftTypeSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShiftModel = model<IShift>("Shift", ShiftSchema);

export default ShiftModel;
