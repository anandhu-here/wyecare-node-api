import { Router } from "express";
import AuthMiddleware from "src/middlewares/Auth";
import TimelineController from "./TimelineController";

const _timelineCtrl = new TimelineController();

const TimelineRouter: Router = Router();

TimelineRouter.route("/current-agency").get(
  AuthMiddleware.isAuthenticatedUser,
  _timelineCtrl.getCurrentAgency
);

TimelineRouter.route("/previous-agencies").get(
  AuthMiddleware.isAuthenticatedUser,
  _timelineCtrl.getPreviousAgencies
);

TimelineRouter.route("/remove-current-agency").delete(
  AuthMiddleware.isAuthenticatedUser,
  _timelineCtrl.removeCurrentAgency
);

export default TimelineRouter;
