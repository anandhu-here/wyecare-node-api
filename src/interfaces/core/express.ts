import type { NextFunction, Request, Response } from "express";
import type { IUserModel } from "../entities/user";
import { UploadedFile } from "express-fileupload";

export interface IRequest extends Request {
  currentUser?: IUserModel;
  token?: string;
  invToken?: string;
  files?: {
    [key: string]: UploadedFile;
  };
}
/**
 * Define custom Express's Response interface
 */
export interface IResponse extends Response {}

/**
 * Define custom Express's NextFunction interface
 */
export interface INext extends NextFunction {}
