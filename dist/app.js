"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_1 = __importDefault(require("http-status"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const appointment_service_1 = require("./app/modules/Appointment/appointment.service");
const node_cron_1 = __importDefault(require("node-cron"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Configure CORS dynamically
const allowedOrigins = ((_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",")) || [
    "http://localhost:3000",
];
const app = (0, express_1.default)();
// CORS
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://ph-healthcare-frontend-o62r.vercel.app",
        "https://ph-healthcare-frontend-poe5ipo6g-azir-uddins-projects.vercel.app",
    ],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// Body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.options("*", (0, cors_1.default)());
node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        appointment_service_1.AppointmentService.cancelUnpaidAppointments();
    }
    catch (err) {
        console.error("Error canceling unpaid appointments:", err);
    }
}));
// Root route
app.get("/", (req, res) => {
    res.send({
        message: "Ph Health Care Server is running...",
    });
});
// API routes
app.use("/api/v1", routes_1.default);
// Handle 404 errors before the global error handler
app.all("*", (req, res, next) => {
    next({
        status: http_status_1.default.NOT_FOUND,
        message: "API Not Found!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});
// Global error handler
app.use(globalErrorHandler_1.default);
exports.default = app;
