import { Request, Response } from "express";
import { userService } from "./user.sevice";

const createAdmin = async (req: Request, res: Response) => {
  console.log("azir control", req.body);
  try {
    const result = await userService.createAdmin(req.body);

    res.status(200).json({
      success: true,
      message: "Admin user CREATED successfully !",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong !",
    });
  }
};

export const userController = {
  createAdmin,
};
