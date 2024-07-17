import StatusCodes from "src/constants/statusCodes";
import { IRequest, IResponse } from "src/interfaces/core/express";
import TimesheetService from "src/services/TimesheetService";
class TimesheetController {
  private readonly _timesheetService: TimesheetService;

  constructor() {
    this._timesheetService = new TimesheetService();
  }

  public createTimesheet = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const { shiftId } = req.body;
      if (!shiftId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Shift ID is required" });
        return;
      }
      const carerId = req.currentUser._id as string;

      const timesheet = await this._timesheetService.createTimesheet(
        shiftId,
        carerId
      );

      res.status(StatusCodes.CREATED).json(timesheet);
    } catch (error) {
      console.error("Error creating timesheet:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
  public getTimesheets = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const timesheets = await this._timesheetService.getTimesheets(
        req.currentUser.accountType as string,
        req.currentUser._id as string
      );
      res.status(StatusCodes.OK).json(timesheets || []);
    } catch (error) {
      console.error("Error getting timesheets:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  public getTimesheetsByHomeId = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const homeId = req.currentUser._id;
      const timesheets = await this._timesheetService.getTimesheetsByHomeId(
        homeId as string
      );

      res.status(StatusCodes.OK).json(timesheets);
    } catch (error) {
      console.error("Error getting timesheets by home ID:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  public approveTimesheet = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const { timesheetId } = req.params;
      const { rating, review } = req.body;

      const updatedTimesheet = await this._timesheetService.approveTimesheet(
        timesheetId,
        rating,
        review
      );

      if (!updatedTimesheet) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Timesheet not found" });
        return;
      }

      res.status(StatusCodes.OK).json(updatedTimesheet);
    } catch (error) {
      console.error("Error approving timesheet:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  public rejectTimesheet = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const { timesheetId } = req.params;
      const updatedTimesheet = await this._timesheetService.rejectTimesheet(
        timesheetId
      );

      if (!updatedTimesheet) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Timesheet not found" });
        return;
      }

      res.status(StatusCodes.OK).json(updatedTimesheet);
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
}

export default TimesheetController;
