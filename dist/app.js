"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_1 = __importDefault(require("http-status"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const appointment_service_1 = require("./app/modules/Appointment/appointment.service");
const node_cron_1 = __importDefault(require("node-cron"));
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
node_cron_1.default.schedule("* * * * *", () => {
    try {
        appointment_service_1.AppointmentService.cancelUnpaidAppointments();
    }
    catch (err) {
        console.error(err);
    }
});
// Root route
app.get("/", (req, res) => {
    res.send({
        message: "Ph health care server..",
    });
});
// API routes
app.use("/api/v1", routes_1.default);
// Handle 404 errors before the global error handler
app.use((req, res) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
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
