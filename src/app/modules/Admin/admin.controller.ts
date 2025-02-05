//
import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { AdminService } from "./admin.service";
import { adminFilterableFields } from "./admin.constant";
import pick from "../../../shared/pick";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const getAllFromDB = async (req: Request, res: Response) => {
  try {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AdminService.getAllFromDB(filters, options);
    res.status(200).json({
      success: true,
      message: "Admin is data fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong !",
    });
  }
};

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data fetched by id!",
    data: result,
  });
});
//update controller
const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.updateIntoDB(id, req.body);
  sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data updated!",
      data: result
  })
})

export const AdminController = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
};
