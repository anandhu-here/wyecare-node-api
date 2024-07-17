import { NextFunction } from "express";
import { IRequest, IResponse } from "src/interfaces/core/express";

class TimesheetMiddleWare {
  public static async validateCreateTimesheet(
    req: IRequest,
    res: IResponse,
    next: NextFunction
  ) {
    try {
      const { currentUser } = req;
      if (currentUser.accountType === "carer") {
        next();
      } else {
        return res
          .status(403)
          .json({ error: "Only carer can create timesheet" });
      }
    } catch (error) {
      console.error("Error validating create timesheet:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  public static async validateApproval(
    req: IRequest,
    res: IResponse,
    next: NextFunction
  ) {
    try {
      const { currentUser } = req;

      if (currentUser.accountType === "home") {
        next();
      } else {
        return res
          .status(403)
          .json({ error: "Only home can approve timesheet" });
      }
    } catch (error) {
      console.error("Error validating approval:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default TimesheetMiddleWare;
// Compare this snippet from src/modules/Timesheet/TimesheetService.ts:
