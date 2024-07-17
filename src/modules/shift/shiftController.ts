import { Response } from "express";
import StatusCodes from "src/constants/statusCodes";
import StringValues from "src/constants/strings";
import type { IRequest, IResponse } from "src/interfaces/core/express";
import ShiftService from "src/services/ShiftService";
import { Types } from "mongoose";
import type { IShift } from "src/interfaces/entities/shift";
import UserShiftTypeService from "src/services/ShiftTypeService";
import Logger from "src/logger";

class ShiftController {
  private readonly _shiftSvc: ShiftService;
  private readonly _shiftTypeSvc: UserShiftTypeService;

  constructor() {
    this._shiftSvc = new ShiftService();
    this._shiftTypeSvc = new UserShiftTypeService();
  }

  public getShiftById = async (req: IRequest, res: Response): Promise<void> => {
    try {
      const { shiftId } = req.params;
      const shift = await this._shiftSvc.getShiftById(shiftId);
      res.status(StatusCodes.OK).json(shift);
    } catch (error) {
      console.error("Error getting shift by id:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  public getShifts = async (req: IRequest, res: Response): Promise<void> => {
    try {
      const currentUser = req.currentUser;

      let shifts: IShift[] = [];

      if (
        currentUser.accountType === "home" ||
        currentUser.accountType === "nurse"
      ) {
        shifts = await this._shiftSvc.getPublishedShifts(
          currentUser._id as string
        );
      } else if (currentUser.accountType === "agency") {
        shifts = await this._shiftSvc.getShifts(currentUser._id as string);
      } else if (currentUser.accountType === "carer") {
        shifts = await this._shiftSvc.getAssignedShifts(
          currentUser._id as string
        );
      }

      res.status(StatusCodes.OK).json(shifts);
    } catch (error) {
      console.error("Error getting shifts:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };
  public getUnAcceptedShifts = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const currentUser = req.currentUser;

      let shifts: IShift[] = [];

      if (currentUser.accountType !== "home") {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Cannot get unaccepted shifts" });
        return;
      }

      shifts = await this._shiftSvc.getunAcceptedShifts(
        currentUser._id as string
      );

      res.status(StatusCodes.OK).json(shifts);
    } catch (error) {
      console.error("Error getting shifts:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  public createShift = async (req: IRequest, res: Response): Promise<void> => {
    try {
      let shiftData = req.body;
      const currentUser = req.currentUser;

      if (currentUser.accountType !== "home") {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Cannot create shift" });
        return;
      }

      const shiftTypeExists = await this._shiftTypeSvc.checkShiftType(
        currentUser._id as string
      );

      if (!shiftTypeExists) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Shift type does not exist kkk" });
        return;
      }

      // Find the specific ShiftTypeSchema object within the shifttypes array

      const shiftType = shiftTypeExists.shifttypes.find((type) => {
        let shiftTypestr = type._id.toString();
        return shiftTypestr === shiftData.shiftType.toString();
      });

      if (!shiftType) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Shift type does not exist" });
        return;
      }
      shiftData.homeId = currentUser._id.toString();

      const createdShift = await this._shiftSvc.createShift(
        shiftData,
        shiftType
      );
      res.status(StatusCodes.CREATED).json(createdShift);
    } catch (error) {
      console.error("Error creating shift:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  public createMultipleShifts = async (
    req: IRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { shiftsData } = req.body;
      const currentUser = req.currentUser;

      if (currentUser.accountType !== "home") {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Cannot create shifts" });
        return;
      }

      const shiftTypeExists = await this._shiftTypeSvc.checkShiftType(
        currentUser._id as string
      );

      if (!shiftTypeExists) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Shift type does not exist" });
        return;
      }

      console.log("Shifts data:", shiftsData);

      const createdShifts = await this._shiftSvc.createMultipleShifts(
        shiftsData,
        shiftTypeExists.shifttypes,
        currentUser._id.toString()
      );

      res.status(StatusCodes.CREATED).json(createdShifts);
    } catch (error) {
      console.error("Error creating shifts:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  public deleteShift = async (req: IRequest, res: Response): Promise<void> => {
    try {
      const { shiftId } = req.params;
      const shift = await this._shiftSvc.deleteShift(shiftId);
      res
        .status(StatusCodes.OK)
        .json({ message: StringValues.SUCCESS, shift: shift });
    } catch (error) {
      console.error("Error deleting shift:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  public updateShift = async (req: IRequest, res: Response): Promise<void> => {
    try {
      const shiftId = req.params.shiftId;
      const updatedShiftData = req.body;
      const currentUser = req.currentUser;

      const shift = await this._shiftSvc.getShiftById(shiftId);

      if (!shift) {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Shift not found" });
        return;
      }

      if (shift.homeId.toString() !== currentUser._id.toString()) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Not authorized to update this shift" });
        return;
      }

      const shiftTypeExists = await this._shiftTypeSvc.checkShiftType(
        currentUser._id as string
      );

      if (!shiftTypeExists) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Shift type does not exist" });
        return;
      }

      const shiftType = shiftTypeExists.shifttypes.find((type) => {
        let shiftTypestr = type._id.toString();
        return shiftTypestr === updatedShiftData.shiftType.toString();
      });

      if (!shiftType) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Shift type does not exist" });
        return;
      }

      const updatedShift = await this._shiftSvc.updateShift(
        shiftId,
        updatedShiftData,
        shiftType
      );

      res.status(StatusCodes.OK).json(updatedShift);
    } catch (error) {
      console.error("Error updating shift:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  public acceptShift = async (req: IRequest, res: Response): Promise<void> => {
    try {
      const shiftId = req.params.shiftId;

      const shift = await this._shiftSvc.getShiftById(shiftId);

      if (!shift) {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Shift not found" });
        return;
      }
      const updatedShift = await this._shiftSvc.acceptShift(shiftId);

      res.status(StatusCodes.OK).json(updatedShift);
    } catch (error) {
      console.error("Error accepting shift:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  public rejectShift = async (req: IRequest, res: Response): Promise<void> => {
    try {
      const shiftId = req.params.shiftId;
      const currentUser = req.currentUser;

      const shift = await this._shiftSvc.getShiftById(shiftId);

      if (!shift) {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Shift not found" });
        return;
      }

      if (shift.agentId.toString() !== currentUser._id.toString()) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Not authorized to reject this shift" });
        return;
      }

      const updatedShift = await this._shiftSvc.rejectShift(shiftId);

      res.status(StatusCodes.OK).json(updatedShift);
    } catch (error) {
      console.error("Error rejecting shift:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };

  // Assign a user to a shift

  public assignUsers = async (req: IRequest, res: Response): Promise<void> => {
    try {
      const shiftId = req.params.shiftId;
      const userIds = req.body.userIds;
      const currentUser = req.currentUser;

      const shift = await this._shiftSvc.getShiftById(shiftId);

      console.log("Shift:", shift);

      if (!shift) {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Shift not found" });
        return;
      }

      if (shift.homeId.toString() !== currentUser._id.toString()) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Not authorized to assign users to this shift" });
        return;
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user IDs" });
        return;
      }

      const updatedShift = await this._shiftSvc.assignUsers(shiftId, userIds);

      res.status(StatusCodes.OK).json(updatedShift);
    } catch (error) {
      console.error(error, "andi");
      res.status(StatusCodes.BAD_REQUEST).json({ message: error });
    }
  };

  public assignCarersToShift = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const currentUser = req.currentUser;
      const { shiftId, carerIds } = req.body;

      if (currentUser.accountType !== "agency") {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Only agencies can assign carers to shifts" });
        return;
      }

      const linkedCarerIds = currentUser.linkedUsers
        .find((linkedUser) => linkedUser.accountType === "carer")
        ?.users.map((userId) => userId.toString());

      const validCarerIds = carerIds.filter((carerId: string) =>
        linkedCarerIds?.includes(carerId)
      );

      if (validCarerIds.length !== carerIds.length) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "Some of the provided carer IDs are not linked to the agency",
        });
        return;
      }

      const objectValidCarerIds = validCarerIds.map(
        (carerId) => new Types.ObjectId(carerId)
      );

      const updatedShift: IShift | null =
        await this._shiftSvc.assignCarersToShift(shiftId, objectValidCarerIds);

      if (!updatedShift) {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Shift not found" });
        return;
      }

      res.status(StatusCodes.OK).json({
        message: "Carers assigned to shift successfully",
        shift: updatedShift,
      });
    } catch (error) {
      console.error("Error assigning carers to shift:", error);
      res.status(StatusCodes.BAD_REQUEST).json({ message: error });
    }
  };
  public unassignCarerFromShift = async (
    req: IRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { shiftId } = req.params;
      const { carerId } = req.body;

      const updatedShift = await this._shiftSvc.unassignCarerFromShift(
        shiftId,
        carerId
      );

      if (!updatedShift) {
        res.status(404).json({ message: "Shift not found" });
        return;
      }

      res.status(200).json({
        message: "Carer unassigned from shift successfully",
        shift: updatedShift,
      });
    } catch (error) {
      console.error("Error unassigning carer from shift:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  public generateQRCode = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const { shiftId } = req.params;
      if (req.currentUser.accountType !== "nurse") {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Only nurses can generate QR codes" });
        return;
      }
      const qrCodeData = await this._shiftSvc.generateQRCode(shiftId);
      Logger.info("QR code data:", qrCodeData);
      res.status(200).json(qrCodeData);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  };

  public verifyPublicKey = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const { shiftId } = req.params;
      const { publicKey, carerId } = req.body;
      const result = await this._shiftSvc.verifyPublicKey(
        shiftId,
        publicKey,
        carerId
      );
      res.status(200).json({ success: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify public key" });
    }
  };
}

export default ShiftController;
