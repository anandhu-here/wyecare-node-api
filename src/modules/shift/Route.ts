import { Router } from "express";
import ShiftController from "./shiftController";
import AuthMiddleware from "src/middlewares/Auth";
import ShiftMiddleware from "src/middlewares/shift";
import validateAgencyAccept from "src/validators/shift";

const ShiftRouter: Router = Router();
const _shiftController = new ShiftController();

/**
 * @name ShiftController.getShifts
 * @description Get all shifts.
 * @route GET /api/v1/shifts
 * @access private
 */
ShiftRouter.route("/").get(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.getShifts
);
/**
 * @name ShiftController.getUnAcceptedShifts
 * @description Get all unaccepted shifts.
 * @route GET /api/v1/shifts/unaccepted
 * @access private
 * @returns {IShift[]}
 * @throws {Error}
 */

ShiftRouter.route("/unaccepted").get(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.getUnAcceptedShifts
);

/**
 * @name ShiftController.getShift
 * @description Get a shift by ID.
 * @route GET /api/v1/shifts/:shiftId
 * @access private
 */

ShiftRouter.route("/:shiftId").get(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.getShiftById
);

/**
 * @name ShiftController.createShift
 * @description Create a new shift.
 * @route POST /api/v1/shifts
 * @access private
 */
ShiftRouter.route("/").post(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.createShift
);

/**
 * @name ShiftController.createMultiple
 * @description Create multiple shifts.
 * @route POST /api/v1/shifts/multiple
 */
ShiftRouter.route("/multiple").post(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.createMultipleShifts
);

/**
 * @name ShiftController.deleteShift
 * @description Delete a shift.
 * @route DELETE /api/v1/shifts/:shiftId
 * @access private
 */
ShiftRouter.route("/:shiftId").delete(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.deleteShift
);

/**
 * @name ShiftController.updateShift
 * @description Update a shift.
 * @route PUT /api/v1/shifts/:shiftId
 * @access private
 */
ShiftRouter.route("/:shiftId").put(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.updateShift
);

/**
 * @name ShiftController.assignUsers
 * @description Assign users to a shift.
 * @route PUT /api/v1/shifts/:shiftId/assign
 * @access private
 */

ShiftRouter.route("/:shiftId/assign").put(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.assignUsers
);

/**
 * @name ShiftController.acceptShift
 * @description Accept a shift.
 * @route PUT /api/v1/shifts/:shiftId/accept
 * @access private
 */
ShiftRouter.route("/:shiftId/accept").put(
  AuthMiddleware.isAuthenticatedUser,
  validateAgencyAccept,
  _shiftController.acceptShift
);

/**
 * @name ShiftController.rejectShift
 * @description Reject a shift.
 * @route PUT /api/v1/shifts/:shiftId/reject
 * @access private
 */
ShiftRouter.route("/:shiftId/reject").put(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.rejectShift
);

ShiftRouter.route("/assign-carers").post(
  AuthMiddleware.isAuthenticatedUser,
  ShiftMiddleware.validateAssignCarers,
  _shiftController.assignCarersToShift
);

ShiftRouter.route("/:shiftId/unassign-carer").post(
  AuthMiddleware.isAuthenticatedUser,
  ShiftMiddleware.validateUnassignCarer,
  _shiftController.unassignCarerFromShift
);
ShiftRouter.route("/:shiftId/generateQR").post(
  AuthMiddleware.isAuthenticatedUser,
  _shiftController.generateQRCode
);
export default ShiftRouter;
