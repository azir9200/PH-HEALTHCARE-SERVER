"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const prescription_controller_1 = require("./prescription.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// router.get(
//     '/',
//     auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//     PrescriptionController.getAllFromD
// );
router.get('/my-prescription', (0, auth_1.default)(client_1.UserRole.PATIENT), prescription_controller_1.PrescriptionController.patientPrescription);
router.post("/", (0, auth_1.default)(client_1.UserRole.DOCTOR), 
// validateRequest(PrescriptionValidation.create),
prescription_controller_1.PrescriptionController.insertIntoDB);
exports.PrescriptionRoutes = router;
