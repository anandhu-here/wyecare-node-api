import ShiftModel from "src/models/Shift";
import { Types } from "mongoose";
import type { IShift } from "src/interfaces/entities/shift";
import type { IShiftType } from "src/interfaces/entities/shift-types";
import StatusCodes from "src/constants/statusCodes";
import CustomError from "src/helpers/ErrorHelper";
import NodeRSA from "node-rsa";
import QRCode from "qrcode";
import TimesheetModel from "src/models/Timesheet";
import { ITimesheet } from "src/interfaces/entities/timesheet";
import Logger from "src/logger";

class ShiftService {
  public getPublishedShifts = async (
    userId: string | Types.ObjectId
  ): Promise<IShift[]> => {
    const shifts = await ShiftModel.find({
      homeId: userId,
    })
      .populate("shiftType")
      .populate({
        path: "homeId",
        select: "_id company",
      })
      .populate({
        path: "assignedUsers",
        select: "_id fname lname",
      })
      .populate({
        path: "agentId",
        select: "_id company",
      });
    return shifts;
  };

  public getAssignedShifts = async (
    userId: string | Types.ObjectId
  ): Promise<any> => {
    try {
      const shifts = await ShiftModel.find({
        assignedUsers: new Types.ObjectId(userId),
      })
        .populate("shiftType")
        .populate({
          path: "homeId",
          select: "_id company",
        })
        .populate({
          path: "assignedUsers",
          select: "_id fname lname",
        })
        .populate({
          path: "agentId",
          select: "_id company",
        })
        .exec();

      const shiftPromises = shifts.map(async (shift) => {
        const timesheet = await TimesheetModel.findOne({
          shiftId: shift._id,
          carerId: userId,
        });
        return { ...shift.toObject(), timesheet: timesheet || null };
      });

      Logger.info("Shifts:", shiftPromises);

      return await Promise.all(shiftPromises);
    } catch (error) {
      console.error("Error getting shifts by assigned user:", error);
      throw new Error(`Failed to get shifts by assigned user`);
    }
  };

  public getunAcceptedShifts = async (userId: string): Promise<IShift[]> => {
    const shifts = await ShiftModel.find({
      homeId: userId,
      isAccepted: false,
    });
    console.log(shifts, "shifts");
    return shifts;
  };

  public getShiftById = async (
    shiftId: string | Types.ObjectId
  ): Promise<IShift | null> => {
    try {
      const shift = await ShiftModel.findById(shiftId).exec();
      console.log("Shift without populate:", shift);

      const populatedShift = await ShiftModel.findById(shiftId)
        .populate("shiftType")
        .exec();

      console.log("Shift with populate:", populatedShift);

      if (!populatedShift) {
        console.log("Shift not found");
        return null;
      }

      return populatedShift;
    } catch (error) {
      console.error("Error retrieving shift:", error);
      return null;
    }
  };
  public getShifts = async (
    userId: string | Types.ObjectId
  ): Promise<IShift[]> => {
    const shifts = await ShiftModel.find({ agentId: userId })
      .populate({
        path: "homeId",
        select: "_id company",
      })
      .populate({
        path: "assignedUsers",
        select: "_id fname lname",
      })
      .populate({
        path: "agentId",
        select: "_id company",
      });
    return shifts;
  };

  public createShift = async (
    shiftData: IShift,
    shiftType
  ): Promise<IShift> => {
    console.log("Shift data:", shiftData);
    const newShift = ShiftModel.create({
      ...shiftData,
      shiftType,
    });
    return newShift;
  };
  public createMultipleShifts = async (
    shiftsData: IShift[],
    shiftTypes: IShiftType[],
    homeId: string
  ): Promise<IShift[]> => {
    const createdShifts: IShift[] = [];

    for (const shiftData of shiftsData) {
      const shiftType = shiftTypes.find((type) => {
        let shiftTypestr = type._id.toString();
        return shiftTypestr === shiftData.shiftType.toString();
      });

      if (shiftType) {
        let assignedUsers = shiftData.assignedUsers || [];
        let objectifiedAssignedUsers = assignedUsers.map((userId) => {
          return new Types.ObjectId(userId);
        });
        const newShift = await ShiftModel.create({
          ...shiftData,
          shiftType,
          homeId,
          isAccepted: objectifiedAssignedUsers.length > 0,
          agentId:
            shiftData.agentId === "internal" ? undefined : shiftData.agentId,
          assignedUsers: objectifiedAssignedUsers || [],
        });
        createdShifts.push(newShift);
      }
    }

    return createdShifts;
  };
  public deleteShift = async (
    shiftId: string | Types.ObjectId
  ): Promise<IShift | null> => {
    const deletedShift = await ShiftModel.findByIdAndDelete(shiftId);
    return deletedShift;
  };

  public updateShift = async (
    shiftId: string,
    updatedShiftData: Partial<IShift>,
    shiftType: any
  ): Promise<IShift | null> => {
    const updatedShift = await ShiftModel.findByIdAndUpdate(
      shiftId,
      {
        ...updatedShiftData,
        shiftType,
      },
      { new: true }
    ).exec();

    return updatedShift;
  };

  public acceptShift = async (shiftId: string): Promise<IShift | null> => {
    const updatedShift = await ShiftModel.findByIdAndUpdate(
      shiftId,
      {
        isAccepted: true,
        isRejected: false,
      },
      { new: true }
    ).exec();
    return updatedShift;
  };

  public rejectShift = async (shiftId: string): Promise<IShift | null> => {
    const updatedShift = await ShiftModel.findByIdAndUpdate(
      shiftId,
      {
        isRejected: true,
        agentId: undefined,
        isAccepted: false,
      },
      { new: true }
    ).exec();
    return updatedShift;
  };

  // Assign users
  public assignUsers = async (
    shiftId: string,
    userIds: string[]
  ): Promise<IShift | null> => {
    try {
      const shift = await ShiftModel.findById(shiftId).exec();
      const existingUserIds = shift.assignedUsers.map((userId) =>
        userId.toString()
      );
      const isDuplicateUser = userIds.some((userId) =>
        existingUserIds.includes(userId)
      );

      if (isDuplicateUser) {
        throw new Error("User is already assigned to this shift");
      }

      if (!shift) {
        throw new Error("Shift not found");
      }

      if (userIds.length > shift.count) {
        throw new Error("Number of users exceeds the shift count");
      }

      shift.assignedUsers = userIds.map((userId) => new Types.ObjectId(userId));
      await shift.save();

      return shift;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  public async assignCarersToShift(
    shiftId: string,
    validCarerIds: Types.ObjectId[]
  ): Promise<IShift | null> {
    try {
      const shift: IShift | null = await ShiftModel.findById(shiftId);

      if (shift.isCompleted) {
        throw new CustomError(
          "Shift is already completed",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!shift) {
        throw new CustomError("Shift not found", StatusCodes.NOT_FOUND);
      }

      const updateFields: Partial<IShift> = {
        isAccepted: true,
      };

      const existingAssignedUsers = shift.assignedUsers || [];
      const combinedAssignedUsers = [
        ...existingAssignedUsers,
        ...validCarerIds,
      ];
      const uniqueAssignedUsers = Array.from(
        new Set(combinedAssignedUsers.map(String))
      ).map((ObjectId) => new Types.ObjectId(ObjectId));
      updateFields.assignedUsers = uniqueAssignedUsers;

      if (updateFields.assignedUsers.length === shift.count) {
        updateFields.isCompleted = true;
      }

      const updatedShift: IShift | null = await ShiftModel.findByIdAndUpdate(
        shiftId,
        { $set: updateFields },
        { new: true }
      ).populate({
        path: "assignedUsers",
        select: "_id fname lname",
      });

      return updatedShift;
    } catch (error) {
      console.error("Er", error);
      if (error instanceof CustomError) {
        throw error.message;
      }
      throw error;
    }
  }
  public async unassignCarerFromShift(
    shiftId: string,
    carerId: Types.ObjectId
  ): Promise<IShift | null> {
    try {
      const shift: IShift | null = await ShiftModel.findById(shiftId);

      if (!shift) {
        throw new Error("Shift not found");
      }

      const updatedAssignedUsers = shift.assignedUsers.filter(
        (userId) => !userId.equals(carerId)
      );

      const updatedShift: IShift | null = await ShiftModel.findByIdAndUpdate(
        shiftId,
        {
          $set: {
            assignedUsers: updatedAssignedUsers,
            isCompleted: updatedAssignedUsers.length === shift.count,
          },
        },
        { new: true }
      ).populate({
        path: "assignedUsers",
        select: "_id fname lname",
      });

      return updatedShift;
    } catch (error) {
      throw error;
    }
  }
  public async generateQRCode(
    shiftId: string
  ): Promise<{ publicKey: string; qrCodeData: string }> {
    const shift = await ShiftModel.findById(shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }

    const key = new NodeRSA({ b: 512 });
    const privateKey = key.exportKey("pkcs1-private-pem");
    const publicKey = key.exportKey("pkcs1-public-pem");

    shift.privateKey = privateKey;
    await shift.save();

    const qrCodeData = await QRCode.toDataURL(publicKey);

    return { publicKey, qrCodeData };
  }

  public async verifyPublicKey(
    shiftId: string,
    publicKey: string,
    carerId: string
  ): Promise<boolean> {
    const shift = await ShiftModel.findById(shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }

    const key = new NodeRSA(shift.privateKey);
    const isValid = key.verify(carerId, publicKey, "utf8", "pkcs1-public-pem");

    if (isValid) {
      shift.signedCarers[carerId] = publicKey;
      await shift.save();
    }

    return isValid;
  }
}

export default ShiftService;
