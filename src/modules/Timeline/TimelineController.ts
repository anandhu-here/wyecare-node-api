import { Response } from "express";
import { Types } from "mongoose";
import StatusCodes from "src/constants/statusCodes";
import { IRequest, IResponse } from "src/interfaces/core/express";
import TimelineService from "src/services/TimelineService";

class TimelineController {
  private readonly _timelineService: TimelineService;

  constructor() {
    this._timelineService = new TimelineService();
  }

  /**
   * Retrieves the current agency details for the logged-in carer.
   * @param {IRequest} req - The request object.
   * @param {IResponse} res - The response object.
   */
  public getCurrentAgency = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const carerId = req.currentUser._id;
      const currentAgency = await this._timelineService.getCurrentAgency(
        carerId as Types.ObjectId
      );

      if (!currentAgency) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Current agency not found" });
        return;
      }

      res.status(StatusCodes.OK).json(currentAgency);
    } catch (error) {
      console.error("Error getting current agency:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  /**
   * Retrieves the previous agencies for the logged-in carer.
   * @param {IRequest} req - The request object.
   * @param {IResponse} res - The response object.
   */
  public getPreviousAgencies = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const carerId = req.currentUser._id;
      const previousAgencies = await this._timelineService.getPreviousAgencies(
        carerId as Types.ObjectId
      );

      res.status(StatusCodes.OK).json(previousAgencies);
    } catch (error) {
      console.error("Error getting previous agencies:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  /**
   * Adds a new agency to the carer's timeline.
   * @param {IRequest} req - The request object, containing the new agency details.
   * @param {IResponse} res - The response object.
   */
  public addAgencyToTimeline = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const carerId = req.currentUser._id;
      const { newAgencyId, newAgencyStartDate, newAgencyDescription } =
        req.body;

      const updatedTimeline = await this._timelineService.addAgencyToTimeline(
        carerId as Types.ObjectId,
        newAgencyId,
        newAgencyStartDate,
        newAgencyDescription
      );

      res.status(StatusCodes.OK).json(updatedTimeline);
    } catch (error) {
      console.error("Error adding agency to timeline:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
  /**
   * Removes the current agency from the carer's timeline.
   * @param {IRequest} req - The request object.
   * @param {IResponse} res - The response object.
   */
  public removeCurrentAgency = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const carerId = req.currentUser._id;
      const updatedTimeline = await this._timelineService.removeCurrentAgency(
        carerId as Types.ObjectId
      );

      if (!updatedTimeline) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Timeline not found" });
        return;
      }

      res.status(StatusCodes.OK).json(updatedTimeline);
    } catch (error) {
      console.error("Error removing current agency:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
}

export default TimelineController;
