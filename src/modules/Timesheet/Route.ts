import { Router } from "express";
import TimesheetController from "./TimesheetController";
import AuthMiddleware from "src/middlewares/Auth";
import TimesheetMiddleWare from "src/middlewares/timesheet";

const TimesheetRouter: Router = Router();

const _timesheetController = new TimesheetController();

TimesheetRouter.route("/").get(
  AuthMiddleware.isAuthenticatedUser,
  _timesheetController.getTimesheets
);

TimesheetRouter.route("/").post(
  AuthMiddleware.isAuthenticatedUser,
  TimesheetMiddleWare.validateCreateTimesheet,
  _timesheetController.createTimesheet
);

TimesheetRouter.route("/:timesheetId/approve").patch(
  AuthMiddleware.isAuthenticatedUser,
  TimesheetMiddleWare.validateApproval,
  _timesheetController.approveTimesheet
);

TimesheetRouter.route("/:timesheetId/reject").get(
  AuthMiddleware.isAuthenticatedUser,
  TimesheetMiddleWare.validateApproval,
  _timesheetController.rejectTimesheet
);

export default TimesheetRouter;
