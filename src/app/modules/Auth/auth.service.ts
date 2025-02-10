import * as bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { UserStatus } from "@prisma/client";
import config from "../../../config";

const loginUser = async (payload: { email: string; password: string }) => {
  // console.log("user login => auth service", payload);
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  // Generate refresh token
  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
    refreshToken,
  };
};

//refresh token api
const refreshToken = async (token: string) => {
  let decodedData: JwtPayload;
  console.log("cookie paichi", token);
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as string
    );
    
  } catch (err) {
    throw new Error("You are not Authorized!");
  }

  if (!decodedData?.email) {
    throw new Error("Invalid token data!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new Error("User not found!");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      email: decodedData.email,
      role: decodedData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
  return {
    accessToken,
    needPasswordChange: decodedData.needPasswordChange,
  };
};

export const AuthServices = {
  loginUser,
  refreshToken,
};
