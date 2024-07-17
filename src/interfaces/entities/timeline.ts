import { Document, ObjectId } from "mongoose";

export interface ITimelineItem {
  dateStarted: Date;
  dateEnded: Date;
  agencyId: ObjectId;
  description: string;
}

export interface ITimeline extends Document {
  carerId: ObjectId;
  currentAgency: ObjectId;
  timeline: ITimelineItem[];
}
