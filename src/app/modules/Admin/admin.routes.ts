import express, { NextFunction, Request, Response } from "express";
import { AdminController } from "./admin.controller";
import { adminValidationSchemas } from "./admin.validations";
import { AnyZodObject, Schema } from "zod";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.getAllFromDB
);
router.get("/:id", AdminController.getByIdFromDB);
router.patch(
  "/:id",
  validateRequest(adminValidationSchemas.update),
  AdminController.updateIntoDB
);
router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.deleteFromDB
);
router.delete("/soft/:id", AdminController.softDeleteFromDB);

export const AdminRoutes = router;
