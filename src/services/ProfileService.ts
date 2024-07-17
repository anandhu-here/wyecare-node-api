/**
 * Define Profile Service Class
 */

import type {
  ILinkedUser,
  IUser,
  IUserModel,
} from "src/interfaces/entities/user";
import Logger from "../logger";
import User from "src/models/User";

class ProfileService {
  // Get Recruiter Profile Service
  public getProfileExc = async (currentUser: IUserModel): Promise<any> => {
    try {
      // const profileDetails: IRecruiterProfileResponse = {
      //   userId: currentUser._id,
      //   name: currentUser.name,
      //   nameChangedAt: currentUser.nameChangedAt,
      //   email: currentUser.email,
      //   isEmailVerified: currentUser.isEmailVerified,
      //   emailChangedAt: currentUser.emailChangedAt,
      //   countryCode: currentUser.countryCode,
      //   phone: currentUser.phone,
      //   isPhoneVerified: currentUser.isPhoneVerified,
      //   phoneChangedAt: currentUser.phoneChangedAt,
      //   whatsAppNo: currentUser.whatsAppNo,
      //   userType: currentUser.userType,
      //   accountStatus: currentUser.accountStatus,
      //   profileId: recruiterProfile._id,
      //   jobPostsCount: recruiterProfile.jobPostsCount,
      //   companyName: recruiterProfile.companyName,
      //   designation: recruiterProfile.designation,
      //   linkedInUrl: recruiterProfile.linkedInUrl,
      //   website: recruiterProfile.website,
      //   totalEmployees: recruiterProfile.totalEmployees,
      //   address: recruiterProfile.address,
      //   industryType: recruiterProfile.industryType,
      //   companyType: recruiterProfile.companyType,
      //   about: recruiterProfile.about,
      //   logoUrl: recruiterProfile.logoUrl,
      //   tagline: recruiterProfile.tagline,
      //   xUrl: recruiterProfile.xUrl,
      //   instagramUrl: recruiterProfile.instagramUrl,
      //   facebookUrl: recruiterProfile.facebookUrl,
      //   createdAt: currentUser.createdAt,
      //   updatedAt: currentUser.updatedAt,
      // };
      return Promise.resolve(currentUser);
    } catch (error) {
      Logger.error(
        "ProfileService: getProfileExc",
        "errorInfo:" + JSON.stringify(error)
      );
      return Promise.reject(error);
    }
  };
  /**
   * @name getLinkedUsers
   * @description Get linked users filtered by accountType and replace IDs with actual user objects
   * @param userId string
   * @param accountType string
   * @returns Promise<ILinkedUser[]>
   */
  public async getLinkedUsers(
    userId: string,
    accountType?: string
  ): Promise<ILinkedUser[]> {
    try {
      console.log(accountType, "andi");
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error("User not found");
      }

      let linkedUsers: ILinkedUser[] = user.linkedUsers;

      if (accountType) {
        linkedUsers = linkedUsers.filter(
          (linkedUser) => linkedUser.accountType === accountType
        );
      }

      const populatedLinkedUsers = [];

      for (const linkedUser of linkedUsers) {
        if (linkedUser.accountType === accountType) {
          const userIds = linkedUser.users;
          const users = await User.find({ _id: { $in: userIds } })
            .select("-password")
            .exec();

          populatedLinkedUsers.push({
            accountType: linkedUser.accountType,
            users: users,
          });
        }
      }

      return populatedLinkedUsers;
    } catch (error) {
      console.error("Error getting linked users:", error);
      throw error;
    }
  }

  // Create Recruiter Profile Service
  // public createRecruiterExc = async (
  //   _profile: IRecruiterProfile
  // ): Promise<IRecruiterProfileModel> => {
  //   try {
  //     const recruiterProfile = await RecruiterProfile.create(_profile);
  //     return Promise.resolve(recruiterProfile);
  //   } catch (error) {
  //     Logger.error(
  //       "ProfileService: createRecruiterExc",
  //       "errorInfo:" + JSON.stringify(error)
  //     );
  //     return Promise.reject(error);
  //   }
  // };

  public async updateAvailabilities(
    userId: string,
    dates: string[]
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.availabilities) {
        // If availabilities field doesn't exist, create a new one
        user.availabilities = {
          dates: [],
        };
      }

      user.availabilities.dates = [
        ...new Set([...user.availabilities.dates, ...dates]),
      ];
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }
  public async deleteAvailability(
    userId: string,
    date: string
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.availabilities) {
        // If availabilities field doesn't exist, return the user as is
        return user;
      }

      user.availabilities.dates = user.availabilities.dates.filter(
        (d) => d !== date
      );
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default ProfileService;
