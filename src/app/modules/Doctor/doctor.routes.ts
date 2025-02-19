import express from "express";
import { DoctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", DoctorController.getAllFromDB);

router.get("/:id", DoctorController.getByIdFromDB);

router.patch("/:id", DoctorController.updateIntoDB);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
  DoctorController.deleteFromDB
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  DoctorController.softDelete
);

export const DoctorRoutes = router;
