import express, { NextFunction, Request, Response } from "express";
import { SpecialtiesController } from "./specialties.controller";

import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { SpecialtiesValidation } from "./specialties.validation";
import { fileUploader } from "../../../helpers/fileUploader";

const router = express.Router();

router.get("/", SpecialtiesController.getAllFromDB);
router.get("/:id", SpecialtiesController.getByIdFromDB);

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidation.create.parse(JSON.parse(req.body.data));
    return SpecialtiesController.insertIntoDB(req, res, next);
  }
);

// Task 2: Delete Specialties Data by ID

/**
- Develop an API endpoint to delete specialties by ID.
- Implement an HTTP DELETE endpoint accepting the specialty ID.
- Delete the specialty from the database and return a success message.
- ENDPOINT: /specialties/:id
*/

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtiesController.updateIntoDB
);
router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtiesController.deleteFromDB
);

export const SpecialtiesRoutes = router;
