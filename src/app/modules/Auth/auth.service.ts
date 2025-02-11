import * as bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { UserStatus } from "@prisma/client";
import config from "../../../config";
import emailSender from "./emailSender";

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
//password change
const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }
  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
};
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );
  const resetPassLink =
    config.reset_password_link +
    `?userId=${userData.id}&token=${resetPassToken}`;
  console.log("LINK", resetPassLink);

  const sender: any = await emailSender(
    userData.email,
    `
      <div>
          <p>Dear User,</p>
          <p>Your password reset link 
              <a href=${resetPassLink}>
                  <button>
                      Reset Password
                  </button>
              </a>
          </p>

      </div>
      `
  );
  console.log("SENDER", sender);
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
};
