import TimelineModel from "../models/Timeline";
import { Types, Schema } from "mongoose";
import { ITimeline, ITimelineItem } from "../interfaces/entities/timeline";
import { IUser, IUserModel } from "src/interfaces/entities/user";

class TimelineService {
  /**
   * Retrieves the current agency details for the given carer, including the start and end dates.
   * @param {Types.ObjectId} carerId - The ID of the carer.
   * @returns {Promise<(Partial<IUser> & { startDate: Date; endDate: Date }) | null>} - The current agency details with start and end dates, or null if not found.
   */
  public getCurrentAgency = async (
    carerId: Types.ObjectId
  ): Promise<(Partial<IUser> & { startDate: Date; endDate: Date }) | null> => {
    const timeline = await TimelineModel.findOne({ carerId })
      .populate({
        path: "timeline",
        model: "TimelineItem",
        match: { agencyId: { $eq: "$currentAgency" } },
        select: "dateStarted dateEnded agencyId",
        options: { limit: 1 },
      })
      .populate({
        path: "currentAgency",
        model: "User",
        select: "fname lname company",
      })
      .exec();

    if (!timeline || !timeline.currentAgency) {
      return null;
    }

    const [currentAgencyItem] = timeline.timeline;
    const { fname, lname, company, _id } = timeline.currentAgency as any;

    return {
      fname,
      lname,
      company,
      startDate: currentAgencyItem?.dateStarted || null,
      endDate: currentAgencyItem?.dateEnded || null,
    };
  };

  /**
   * Retrieves the previous agencies for the given carer, including the start and end dates.
   * @param {Types.ObjectId} carerId - The ID of the carer.
   * @returns {Promise<(Partial<IUser> & { startDate: Date; endDate: Date })[]>} - The array of previous agency details with start and end dates.
   */
  public getPreviousAgencies = async (
    carerId: Types.ObjectId
  ): Promise<(Partial<IUser> & { startDate: Date; endDate: Date })[]> => {
    const timeline = await TimelineModel.findOne({ carerId })
      .populate({
        path: "timeline",
        model: "TimelineItem",
        select: "dateStarted dateEnded agencyId",
      })
      .populate({
        path: "timeline.agencyId",
        model: "User",
        select: "fname lname company",
      })
      .exec();

    if (!timeline) {
      return [];
    }

    return timeline.timeline
      .filter(
        (item: any) =>
          item.agencyId._id?.toString() !== timeline.currentAgency?.toString()
      )
      .map((item: any) => ({
        _id: item.agencyId._id,
        fname: item.agencyId.fname,
        lname: item.agencyId.lname,
        company: item.agencyId.company,
        startDate: item.dateStarted,
        endDate: item.dateEnded,
      }));
  };

  /**
   * Adds a new agency to the carer's timeline.
   * @param {Types.ObjectId} carerId - The ID of the carer.
   * @param {Schema.Types.ObjectId} newAgencyId - The ID of the new agency.
   * @param {Date} newAgencyStartDate - The start date of the new agency.
   * @param {string} newAgencyDescription - The description of the new agency.
   * @returns {Promise<ITimeline>} - The updated timeline.
   */
  public addAgencyToTimeline = async (
    carerId: Types.ObjectId,
    newAgencyId: Schema.Types.ObjectId,
    newAgencyStartDate: Date,
    newAgencyDescription: string
  ): Promise<ITimeline> => {
    let timeline = await TimelineModel.findOne({ carerId });

    if (!timeline) {
      // Create a new timeline if it doesn't exist
      timeline = await TimelineModel.create({
        carerId,
        currentAgency: newAgencyId,
        timeline: [
          {
            dateStarted: newAgencyStartDate,
            dateEnded: new Date(),
            agencyId: newAgencyId,
            description: newAgencyDescription,
          },
        ],
      });
      return timeline;
    }

    // Check if there's an existing current agency
    if (timeline.currentAgency?.toString() !== newAgencyId.toString()) {
      // Move the current agency to the previous agencies
      timeline.timeline.unshift({
        dateStarted: timeline.timeline[0]?.dateStarted || new Date(),
        dateEnded: new Date(),
        agencyId: timeline.currentAgency,
        description: timeline.timeline[0]?.description || "",
      });

      // Update the current agency
      timeline.currentAgency = newAgencyId;
      timeline.timeline[0] = {
        dateStarted: newAgencyStartDate,
        dateEnded: new Date(),
        agencyId: newAgencyId,
        description: newAgencyDescription,
      };
    }

    await timeline.save();
    return timeline;
  };

  /**
   * Removes the current agency from the carer's timeline.
   * @param {Types.ObjectId} carerId - The ID of the carer.
   * @returns {Promise<ITimeline | null>} - The updated timeline or null if not found.
   */
  public removeCurrentAgency = async (
    carerId: Types.ObjectId
  ): Promise<ITimeline | null> => {
    const timeline = await TimelineModel.findOne({ carerId });

    if (!timeline) {
      return null;
    }

    // Move the current agency to the previous agencies
    timeline.timeline.unshift({
      dateStarted: timeline.timeline[0]?.dateStarted || new Date(),
      dateEnded: new Date(),
      agencyId: timeline.currentAgency,
      description: timeline.timeline[0]?.description || "",
    });

    // Set the current agency to null
    timeline.currentAgency = null;

    await timeline.save();
    return timeline;
  };
}

export default TimelineService;
