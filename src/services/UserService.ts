/**
 * Define User Service Class
 */

import type { ObjectId, UpdateQuery } from "mongoose";
import type { IUser, IUserModel } from "../interfaces/entities/user";
import Logger from "../logger";
import User from "../models/User";

class UserService {
  // Create an `User`
  public createUserExc = async (_user: Partial<IUser>): Promise<IUserModel> => {
    try {
      const user = await User.create(_user);

      return Promise.resolve(user);
    } catch (error) {
      Logger.error(
        "UserService: createUserExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };

  /**
   * Search users by account type and company name
   * @param accountType The account type to filter by (optional)
   * @param companyName The company name to search for (optional)
   * @returns Promise<IUserModel[]>
   */
  public searchUsersExc = async (
    accountType?: string,
    companyName?: string
  ): Promise<IUserModel[]> => {
    try {
      let query: any = {};

      if (accountType) {
        query.accountType = accountType;
      }

      if (companyName) {
        const searchRegex = new RegExp(companyName.replace(/\s+/g, "|"), "i");
        query.$or = [
          { "company.name": { $regex: searchRegex } },
          { fname: { $regex: searchRegex } },
          { lname: { $regex: searchRegex } },
        ];
      }

      const users = await User.find(query).select(
        "_id fname lname email company.name company.address"
      );

      return Promise.resolve(users);
    } catch (error) {
      Logger.error(
        "UserSearchService: searchUsersExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };

  // Find an `User` by Id
  public findUserByIdExc = async (
    _userId: string | ObjectId
  ): Promise<IUserModel> => {
    try {
      const user = await User.findById(_userId);

      return Promise.resolve(user);
    } catch (error) {
      Logger.error(
        "UserService: findUserByIdExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };

  // Find an `User` by an email
  public findUserByEmailExc = async (_email: string): Promise<IUserModel> => {
    try {
      const user = await User.findOne({ email: _email }).populate("company");

      return Promise.resolve(user);
    } catch (error) {
      Logger.error(
        "UserService: findUserByEmailExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };

  public getUsers = async (userType: string): Promise<IUserModel[]> => {
    try {
      const users = await User.find({
        accountType: userType,
      }).select("_id fname lname company.name company.address");

      return Promise.resolve(users);
    } catch (error) {
      Logger.error(
        "UserService: getUsers",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };

  // Check if `User` already registered with the email
  public checkIsEmailExistsExc = async (_email: string): Promise<boolean> => {
    try {
      const user = await User.findOne({ email: _email });

      if (!user) {
        return Promise.resolve(false);
      }

      return Promise.resolve(true);
    } catch (error) {
      Logger.error(
        "UserService: checkIsEmailExistsExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };

  // Check if `User` already registered with the username
  public checkIsUsernameExistsExc = async (
    _username: string
  ): Promise<boolean> => {
    try {
      const user = await User.findOne({ username: _username });

      if (!user) {
        return Promise.resolve(false);
      }

      return Promise.resolve(true);
    } catch (error) {
      Logger.error(
        "UserService: checkIsUsernameExistsExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };

  // Check if `User` already registered with the phone number
  public checkIsPhoneExistsExc = async (_phone: string): Promise<boolean> => {
    try {
      const user = await User.findOne({ phone: _phone });

      if (!user) {
        return Promise.resolve(false);
      }

      return Promise.resolve(true);
    } catch (error) {
      Logger.error(
        "UserService: checkIsEmailExistsExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };
  public async updateUser(
    userId: string,
    updateData: UpdateQuery<IUser>
  ): Promise<IUser | null> {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  public async removeLinkedUser(
    userId: string,
    linkedUserType: string,
    linkedUserId: string
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error("User not found");
      }

      const linkedUserIndex = user.linkedUsers.findIndex(
        (linkedUser) =>
          linkedUser.accountType === linkedUserType &&
          linkedUser.users.some((userId) => userId.toString() === linkedUserId)
      );

      if (linkedUserIndex !== -1) {
        user.linkedUsers[linkedUserIndex].users = user.linkedUsers[
          linkedUserIndex
        ].users.filter((userId) => userId.toString() !== linkedUserId);

        if (user.linkedUsers[linkedUserIndex].users.length === 0) {
          user.linkedUsers.splice(linkedUserIndex, 1);
        }

        await user.save();
      }

      return user;
    } catch (error) {
      console.error("Error removing linked user:", error);
      throw error;
    }
  }
}

export default UserService;
