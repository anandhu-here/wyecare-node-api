// src/models/Resident.ts

import mongoose, { Schema, Document } from "mongoose";

const MedicationSchema = new Schema({
  type: String,
  frequency: {
    times: Number,
    per: {
      type: String,
      enum: ["day", "week"],
    },
  },
  label: String,
  medicineName: String,
  timings: [String],
});

const PersonalCareItemSchema = new mongoose.Schema({
  frequency: {
    times: Number,
    per: {
      type: String,
      enum: ["day", "week"],
    },
  },
  timings: [
    {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (v) {
          return (
            typeof v === "string" || (typeof v === "object" && v.day && v.time)
          );
        },
        message: (props) => `${props.value} is not a valid timing!`,
      },
    },
  ],
});

const MealCareItemSchema = new mongoose.Schema({
  frequency: {
    times: Number,
    per: {
      type: String,
      enum: ["day", "week"],
    },
  },
  defaultTime: String,
});

const PersonalCareSchema = new mongoose.Schema({
  shower: PersonalCareItemSchema,
  bath: PersonalCareItemSchema,
  breakfast: MealCareItemSchema,
  lunch: MealCareItemSchema,
  dinner: MealCareItemSchema,
  snacks: MealCareItemSchema,
  padCheck: PersonalCareItemSchema,
  fluidIntake: PersonalCareItemSchema,
  sleep: PersonalCareItemSchema,
});

const ResidentSchema = new Schema(
  {
    homeId: { type: Schema.Types.ObjectId, ref: "Home", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    profilePictureUrl: String,
    type: {
      type: String,
      enum: ["Permanent", "Temporary", "Respite"],
      required: true,
    },
    medications: [MedicationSchema],
    personalCare: PersonalCareSchema,
  },
  { timestamps: true }
);

export interface IResident extends Document {
  homeId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  roomNumber: string;
  profilePictureUrl?: string;
  type: "Permanent" | "Temporary" | "Respite";
  medications: Array<{
    type: string;
    frequency: {
      times: number;
      per: "day" | "week";
    };
    label: string;
    medicineName: string;
    timings: string[];
  }>;
  personalCare: {
    [key: string]: {
      frequency: {
        times: number;
        per: "day" | "week";
      };
      timings?: string[];
      defaultTime?: string;
    };
  };
}

export default mongoose.model<IResident>("Resident", ResidentSchema);
