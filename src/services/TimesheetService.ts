import TimesheetModel from "../models/Timesheet";
import { ITimesheet } from "../interfaces/entities/timesheet";
import ShiftModel from "src/models/Shift";
import { addHours, parseISO } from "date-fns";
import { IShiftType } from "src/interfaces/entities/shift-types";

class TimesheetService {
  public createTimesheet = async (
    shiftId: string,
    carerId: string
  ): Promise<ITimesheet> => {
    const shift = await ShiftModel.findById(shiftId)
      .populate({
        path: "shiftType",
        select: "name startTime endTime",
      })
      .exec();

    if (!shift) {
      throw new Error("Shift not found");
    }

    const currentTime = new Date();
    const shiftEndTime = parseISO(`${shift.date}T${shift.shiftType.endtime}`);
    const oneHourBeforeEnd = addHours(shiftEndTime, -1);

    if (currentTime >= oneHourBeforeEnd) {
      throw new Error(
        "Cannot create a timesheet within 1 hour of the shift end time"
      );
    }

    const timesheet = await TimesheetModel.create({
      shiftId,
      carerId,
      homeId: shift.homeId,
    });
    return timesheet;
  };
  public getTimesheets = async (
    accountType: string,
    userId: string
  ): Promise<ITimesheet[]> => {
    try {
      let timesheets: ITimesheet[];

      if (accountType === "carer") {
        timesheets = await TimesheetModel.find({
          carerId: userId,
        })
          .populate({
            path: "shiftId",
            select: "shiftType homeId date startTime endTime",
            populate: {
              path: "homeId",
              select: "company",
            },
          })
          .populate({
            path: "carerId",
            select: "fname lname _id",
          });

        console.log(timesheets, "timesheets");
      } else {
        timesheets = await TimesheetModel.find({
          homeId: userId,
        })
          .populate({
            path: "shiftId",
            select: "shiftType homeId date startTime endTime",
          })
          .populate({
            path: "carerId",
            select: "fname lname _id",
          });
      }

      return timesheets;
    } catch (error) {
      console.error("Error getting timesheets:", error);
      throw error;
    }
  };

  public getTimesheetsByHomeId = async (
    homeId: string
  ): Promise<ITimesheet[]> => {
    const timesheets = await TimesheetModel.find({
      "shift.homeId": homeId,
    })
      .populate("shift")
      .exec();
    return timesheets;
  };

  public approveTimesheet = async (
    timesheetId: string,
    rating: number | null = null,
    review: string | null = null
  ): Promise<ITimesheet | null> => {
    const updatedTimesheet = await TimesheetModel.findByIdAndUpdate(
      timesheetId,
      {
        status: "approved",
        rating: rating !== null ? rating : null,
        review: review !== null ? review : null,
      },
      { new: true }
    ).exec();
    return updatedTimesheet;
  };

  public rejectTimesheet = async (
    timesheetId: string
  ): Promise<ITimesheet | null> => {
    const updatedTimesheet = await TimesheetModel.findByIdAndUpdate(
      timesheetId,
      {
        status: "rejected",
      },
      { new: true }
    ).exec();
    return updatedTimesheet;
  };
}

export default TimesheetService;
