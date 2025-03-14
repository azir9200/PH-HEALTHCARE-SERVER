"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorScheduleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const doctorSchedule_controller_1 = require("./doctorSchedule.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
// import { DoctorScheduleValidation } from "./doctorSchedule.validation";
const router = express_1.default.Router();
/**
 * API ENDPOINT: /doctor-schedule/
 *
 * Get all doctor schedule with filtering
 */
router.get("/", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT), doctorSchedule_controller_1.DoctorScheduleController.getAllFromDB);
router.get("/my-schedule", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleController.getMySchedule);
router.post("/", (0, auth_1.default)(client_1.UserRole.DOCTOR), 
//   validateRequest(DoctorScheduleValidation.create),
doctorSchedule_controller_1.DoctorScheduleController.insertIntoDB);
router.delete("/:id", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleController.deleteFromDB);
exports.DoctorScheduleRoutes = router;
