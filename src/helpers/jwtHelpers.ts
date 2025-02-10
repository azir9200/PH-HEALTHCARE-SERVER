import { JwtPayload, Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "60m",
  });

  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
