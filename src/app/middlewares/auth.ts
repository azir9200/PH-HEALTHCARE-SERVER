import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../../helpers/jwtHelpers";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;
      // console.log("TOKEN", token);
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );
      // console.log("auth.ts", verifiedUser);
      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
