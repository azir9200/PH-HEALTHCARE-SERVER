import express, { NextFunction, Request, Response } from "express";
import { AdminController } from "./admin.controller";
import { adminValidationSchemas } from "./admin.validations";
import { AnyZodObject, Schema } from "zod";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.get("/", AdminController.getAllFromDB);
router.get("/:id", AdminController.getByIdFromDB);
router.patch(
  "/:id",
  validateRequest(adminValidationSchemas.update),
  AdminController.updateIntoDB
);
router.delete("/:id", AdminController.deleteFromDB);
router.delete("/soft/:id", AdminController.softDeleteFromDB);

export const AdminRoutes = router;
