"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialtiesRoutes = void 0;
const express_1 = __importDefault(require("express"));
const specialties_controller_1 = require("./specialties.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const specialties_validation_1 = require("./specialties.validation");
const fileUploader_1 = require("../../../helpers/fileUploader");
const router = express_1.default.Router();
router.get("/", specialties_controller_1.SpecialtiesController.getAllFromDB);
router.get("/:id", specialties_controller_1.SpecialtiesController.getByIdFromDB);
router.post("/", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = specialties_validation_1.SpecialtiesValidation.create.parse(JSON.parse(req.body.data));
    return specialties_controller_1.SpecialtiesController.insertIntoDB(req, res, next);
});
router.patch("/:id", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), specialties_controller_1.SpecialtiesController.updateIntoDB);
router.delete("/:id", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), specialties_controller_1.SpecialtiesController.deleteFromDB);
exports.SpecialtiesRoutes = router;
