import { Router } from "express";
import AuthMiddleware from "src/middlewares/Auth";
import Invitation from "./invitationController";
import InvitationService from "src/services/InvitationService";
import UserService from "src/services/UserService";
import InvitationMidleWare from "src/middlewares/invitation";
import HomeStaffInvitation from "./homeStaffInvitationController";
import HomeStaffInvitationService from "src/services/homeStaffInvitationService";

const InvitationRouter: Router = Router();
const _invSvc = new InvitationService();
const _homeStaffInvSvc = new HomeStaffInvitationService();
const _userSvc = new UserService();
const _invController = new Invitation(
    _invSvc,
    _userSvc
);
const _homeStaffInvController = new HomeStaffInvitation(_homeStaffInvSvc, _userSvc);


InvitationRouter.route("/").post(
    AuthMiddleware.isAuthenticatedUser,
    _invController.sendInvitation
)
InvitationRouter.route("/").get(
    AuthMiddleware.isAuthenticatedUser,
    _invController.getInvitations
)
InvitationRouter.route('/token/:invToken').get(
    AuthMiddleware.isAuthenticatedUser,
    _invController.getInvitation
)
InvitationRouter.route("/accept/:invitationId").put(
    AuthMiddleware.isAuthenticatedUser,
    _invController.acceptInvitation
)
InvitationRouter.route("/reject/:invitationId").put(
    AuthMiddleware.isAuthenticatedUser,
    _invController.rejectInvitation
)
InvitationRouter.route("/:invitationId").delete(
    AuthMiddleware.isAuthenticatedUser,
    _invController.cancelInvitation
)


// Home Staff Invitation routes
InvitationRouter.route("/home-staff").post(
    AuthMiddleware.isAuthenticatedUser,
    _homeStaffInvController.sendInvitation
);

InvitationRouter.route("/home-staff").get(
    AuthMiddleware.isAuthenticatedUser,
    _homeStaffInvController.getInvitations
);

InvitationRouter.route('/home-staff/token/:token').get(
    _homeStaffInvController.getInvitationByToken
);

InvitationRouter.route("/home-staff/:invitationId").put(
    AuthMiddleware.isAuthenticatedUser,
    _homeStaffInvController.updateInvitationStatus
);

// InvitationRouter.route("/home-staff/:invitationId").delete(
//     AuthMiddleware.isAuthenticatedUser,
//     _homeStaffInvController.deleteInvitation
// );

export default InvitationRouter;