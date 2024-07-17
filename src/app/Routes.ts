/**
 * Define Routes
 */

import type { Application } from "express";
import LocalConfig from "../configs/LocalConfig";
import Logger from "../logger";
import AuthRouter from "../modules/auth/Router";
import ShiftTypeRouter from "src/modules/shiftsType/Route";
import ShiftRouter from "src/modules/shift/Route";
import InvitationRouter from "src/modules/invitations/Route";
import EmailRouter from "src/modules/email/Route";
import TimesheetRouter from "src/modules/Timesheet/Route";
import TimelineRouter from "src/modules/Timeline/Route";
import CarerDocumentRouter from "src/modules/CarerDoc/Route";
import ResidentRouter from "src/modules/Resident/Route";

class Routes {
  /**
   * @name mountApi
   * @description Mount all api routes
   * @param _express
   * @returns Application
   */
  public mountApi(_express: Application): Application {
    const apiPrefix = LocalConfig.getConfig().API_PREFIX;
    Logger.info("Routes :: Mounting API routes...");

    // Mounting Routes
    _express.use(`/${apiPrefix}/auth`, AuthRouter);
    _express.use(`/${apiPrefix}/shifttype`, ShiftTypeRouter);
    _express.use(`/${apiPrefix}/shift`, ShiftRouter);
    _express.use(`/${apiPrefix}/invitations`, InvitationRouter);
    _express.use(`/${apiPrefix}/email`, EmailRouter);
    _express.use(`/${apiPrefix}/timesheet`, TimesheetRouter);
    _express.use(`/${apiPrefix}/timeline`, TimelineRouter);
    _express.use(`/${apiPrefix}/carer-documents`, CarerDocumentRouter);
    _express.use(`/${apiPrefix}/residents`, ResidentRouter);
    // _express.use(`/${apiPrefix}/job`, JobRouter);

    return _express;
  }
}

export default new Routes();
