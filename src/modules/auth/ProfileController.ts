/**
 * Define Profile Controller Class
 */

import { EHttpMethod } from "../../enums";
import type { IRequest, IResponse, INext } from "../../interfaces/core/express";
import ApiError from "../../exceptions/ApiError";
import StatusCodes from "../../constants/statusCodes";
import StringValues from "../../constants/strings";
import Logger from "../../logger";
import type ProfileService from "src/services/ProfileService";
import UserService from "src/services/UserService";

class ProfileController {
  private readonly _userSvc: UserService;
  private readonly _profileSvc: ProfileService;

  constructor(
    readonly profileSvc: ProfileService,
    readonly userSvc: UserService
  ) {
    this._profileSvc = profileSvc;
    this._userSvc = userSvc;
  }

  /**
   * @name getProfileDetails
   * @description Perform get profile details action.
   * @param req IRequest
   * @param res IResponse
   * @param next INext
   * @returns Promise<any>
   */
  public getProfileDetails = async (
    req: IRequest,
    res: IResponse,
    next: INext
  ): Promise<any> => {
    if (req.method !== EHttpMethod.GET) {
      return next(
        new ApiError(StringValues.INVALID_REQUEST_METHOD, StatusCodes.NOT_FOUND)
      );
    }

    try {
      const currentUser = req.currentUser;
      const token = req.token;
      // if (currentUser.userType === EUserType.Recruiter) {
      //   const userProfile = await RecruiterProfile.findOne({
      //     userId: currentUser._id,
      //   });

      //   if (!userProfile) {
      //     return next(
      //       new ApiError(StringValues.PROFILE_NOT_FOUND, StatusCodes.NOT_FOUND)
      //     );
      //   }

      //   const profileDetails = {
      //     name: currentUser.name,
      //     nameChangedAt: currentUser.nameChangedAt,
      //     email: currentUser.email,
      //     isEmailVerified: currentUser.isEmailVerified,
      //     emailChangedAt: currentUser.emailChangedAt,
      //     countryCode: currentUser.countryCode,
      //     phone: currentUser.phone,
      //     isPhoneVerified: currentUser.isPhoneVerified,
      //     phoneChangedAt: currentUser.phoneChangedAt,
      //     whatsAppNo: currentUser.whatsAppNo,
      //     userType: currentUser.userType,
      //     accountStatus: currentUser.accountStatus,
      //     profileId: userProfile._id,
      //     jobPostsCount: userProfile.jobPostsCount,
      //     companyName: userProfile.companyName,
      //     designation: userProfile.designation,
      //     linkedInUrl: userProfile.linkedInUrl,
      //     website: userProfile.website,
      //     totalEmployees: userProfile.totalEmployees,
      //     address: userProfile.address,
      //     industryType: userProfile.industryType,
      //     companyType: userProfile.companyType,
      //     about: userProfile.about,
      //     logoUrl: userProfile.logoUrl,
      //     tagline: userProfile.tagline,
      //     xUrl: userProfile.xUrl,
      //     instagramUrl: userProfile.instagramUrl,
      //     facebookUrl: userProfile.facebookUrl,
      //     createdAt: currentUser.createdAt,
      //     updatedAt: currentUser.updatedAt,
      //   };

      //   return res.status(StatusCodes.CREATED).json({
      //     success: true,
      //     message: StringValues.SUCCESS,
      //     data: profileDetails,
      //   });
      // }

      // const userProfile = await JobSeekerProfile.findOne({
      //   userId: currentUser._id,
      // });

      // if (!userProfile) {
      //   return next(
      //     new ApiError(StringValues.PROFILE_NOT_FOUND, StatusCodes.NOT_FOUND)
      //   );
      // }

      // const profileDetails = {
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
      //   profileId: userProfile._id,
      //   aadhar: userProfile.aadhar,
      //   gender: userProfile.gender,
      //   dob: userProfile.dob,
      //   address: userProfile.address,
      //   highestEducationalQualification:
      //     userProfile.highestEducationalQualification,
      //   educationalDetails: userProfile.educationalDetails,
      //   appliedJobs: userProfile.appliedJobs,
      //   appliedJobsCount: userProfile.appliedJobsCount,
      //   createdAt: currentUser.createdAt,
      //   updatedAt: currentUser.updatedAt,
      // };

      return res.status(StatusCodes.OK).json({
        success: true,
        message: StringValues.SUCCESS,
        token: token,
        data: {
          ...currentUser,
        },
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || error || StringValues.SOMETHING_WENT_WRONG;

      Logger.error(
        "ProfileController: getProfileDetails",
        "errorInfo:" + JSON.stringify(error)
      );

      res.status(StatusCodes.BAD_REQUEST);
      return res.json({
        success: false,
        error: errorMessage,
      });
    }
  };
  /**
   * @name getLinkedUsers
   * @description Get linked users of the currently authenticated user filtered by accountType
   * @param req IRequest
   * @param res IResponse
   * @returns Promise<any>
   */
  public getLinkedUsers = async (
    req: IRequest,
    res: IResponse
  ): Promise<any> => {
    try {
      const currentUser = req.currentUser;
      const { accountType } = req.params;

      const linkedUsers = await this._profileSvc.getLinkedUsers(
        currentUser._id as string,
        accountType as string
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Linked users retrieved successfully",
        data: linkedUsers,
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || error || StringValues.SOMETHING_WENT_WRONG;

      Logger.error(
        "UserController: getLinkedUsers",
        "errorInfo:" + JSON.stringify(error)
      );

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: errorMessage,
      });
    }
  };
  public updateAvailabilities = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const currentUser = req.currentUser;
      const { dates } = req.body;

      if (!Array.isArray(dates) || dates.length === 0) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Dates array is required and cannot be empty" });
        return;
      }

      const updatedUser = await this._profileSvc.updateAvailabilities(
        currentUser._id as string,
        dates
      );

      res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
      console.error("Error updating availabilities:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };
  public deleteAvailability = async (
    req: IRequest,
    res: IResponse
  ): Promise<void> => {
    try {
      const currentUser = req.currentUser;
      const { date } = req.params;

      const updatedUser = await this._profileSvc.deleteAvailability(
        currentUser._id as string,
        date
      );

      res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
      console.error("Error deleting availability:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: StringValues.INTERNAL_SERVER_ERROR });
    }
  };
  public searchUsers = async (
    req: IRequest,
    res: IResponse,
    next: INext
  ): Promise<any> => {
    if (req.method !== EHttpMethod.GET) {
      return next(
        new ApiError(StringValues.INVALID_REQUEST_METHOD, StatusCodes.NOT_FOUND)
      );
    }

    try {
      const { accountType } = req.params;
      let { companyName } = req.query;

      if (!accountType && !companyName) {
        return next(
          new ApiError(
            StringValues.SEARCH_CRITERIA_REQUIRED,
            StatusCodes.BAD_REQUEST
          )
        );
      }

      if (companyName === undefined || companyName === "") {
        return res.status(StatusCodes.OK).json({
          success: true,
          message: StringValues.SUCCESS,
          data: [],
        });
      }

      // Remove any surrounding quotes from companyName
      if (typeof companyName === "string") {
        companyName = companyName.replace(/^['"]|['"]$/g, "");
      }

      const users = await this._userSvc.searchUsersExc(
        accountType as string,
        companyName as string
      );

      res.status(StatusCodes.OK);
      return res.json({
        success: true,
        message: StringValues.SUCCESS,
        data: users,
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || error || StringValues.SOMETHING_WENT_WRONG;

      Logger.error(
        "UserSearchController: searchUsers",
        "errorInfo:" + JSON.stringify(error)
      );

      res.status(StatusCodes.BAD_REQUEST);
      return res.json({
        success: false,
        error: errorMessage,
      });
    }
  };

  public getUsers = async (req: IRequest, res: IResponse): Promise<any> => {
    try {
      const accountType = req.params.userType;
      if (accountType === undefined || accountType === "null") {
        return res.status(StatusCodes.OK).json({
          success: true,
          message: StringValues.SUCCESS,
          data: [],
        });
      }
      const users = await this._userSvc.getUsers(accountType);
      return res.status(StatusCodes.OK).json({
        success: true,
        message: StringValues.SUCCESS,
        data: users,
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || error || StringValues.SOMETHING_WENT_WRONG;

      Logger.error(
        "UserController: getUsers",
        "errorInfo:" + JSON.stringify(error)
      );

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: errorMessage,
      });
    }
  };
}

export default ProfileController;
