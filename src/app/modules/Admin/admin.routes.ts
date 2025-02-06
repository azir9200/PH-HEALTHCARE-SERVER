import express, { NextFunction, Request, Response } from "express";
import { AdminController } from "./admin.controller";
import { adminValidationSchemas } from "./admin.validations";

const router = express.Router();

//middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log("validation request");
  next();
};

router.get("/", AdminController.getAllFromDB);
router.get("/:id", AdminController.getByIdFromDB);
router.patch(
    '/:id',
     // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    // validateRequest(adminValidationSchemas.update),
    AdminController.updateIntoDB
);
router.delete("/:id", AdminController.deleteFromDB);
router.delete("/soft/:id", AdminController.softDeleteFromDB);

export const AdminRoutes = router;
