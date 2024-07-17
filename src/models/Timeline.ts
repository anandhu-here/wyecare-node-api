import { Schema, model, Types } from "mongoose";
import { ITimeline, ITimelineItem } from "../interfaces/entities/timeline";

const TimelineItemSchema = new Schema<ITimelineItem>({
  dateStarted: {
    type: Date,
    required: true,
  },
  dateEnded: {
    type: Date,
    required: true,
  },
  agencyId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const TimelineSchema = new Schema<ITimeline>(
  {
    carerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentAgency: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    timeline: {
      type: [TimelineItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const TimelineModel = model<ITimeline>("Timeline", TimelineSchema);

export default TimelineModel;
