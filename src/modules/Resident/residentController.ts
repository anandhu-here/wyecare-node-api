// src/controllers/ResidentController.ts

import {
  IRequest as Request,
  IResponse as Response,
} from "src/interfaces/core/express";
import Logger from "src/logger";
import ResidentService from "src/services/ResidentService";

class ResidentController {
  private residentService: ResidentService;

  private processPersonalCareData(data: any): any {
    Object.keys(data.personalCare).forEach((key) => {
      const item = data.personalCare[key];
      if (
        item.frequency &&
        item.frequency.per === "week" &&
        Array.isArray(item.timings)
      ) {
        item.timings = item.timings.map((timing: any) => {
          if (typeof timing === "object" && timing.day && timing.time) {
            return { day: timing.day, time: timing.time };
          }
          return timing;
        });
      }
    });
    return data;
  }

  constructor() {
    this.residentService = new ResidentService();
  }

  public createResident = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const residentData = req.body;
      const newResident = await this.residentService.createResident(
        residentData
      );
      res.status(201).json({ success: true, data: newResident });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  public updateResident = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { residentId } = req.params;
      let updateData = req.body;

      // Process personal care data
      if (updateData.personalCare) {
        updateData = this.processPersonalCareData(updateData);
      }

      const updatedResident = await this.residentService.updateResident(
        residentId,
        updateData
      );
      res.status(200).json({ success: true, data: updatedResident });
    } catch (error: any) {
      console.log(error, "error");
      res.status(400).json({ success: false, error: error.message });
    }
  };

  public getResident = async (req: Request, res: Response): Promise<void> => {
    try {
      const { residentId } = req.params;
      const resident = await this.residentService.getResident(residentId);
      res.status(200).json({ success: true, data: resident });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  };

  public getResidents = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.info("getResidents");
      const { homeId } = req.params;

      console.log(homeId, "homeId");
      if (typeof homeId !== "string") {
        throw new Error("Invalid homeId");
      }
      const residents = await this.residentService.getResidents(homeId);
      res.status(200).json({ success: true, data: residents });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default ResidentController;
