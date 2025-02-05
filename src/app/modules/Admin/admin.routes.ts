import express, { NextFunction, Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get("/", AdminController.getAllFromDB);

export const AdminRoutes = router;
