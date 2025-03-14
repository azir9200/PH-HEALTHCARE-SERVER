import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import httpStatus from "http-status";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import { AppointmentService } from "./app/modules/Appointment/appointment.service";
import cron from "node-cron";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
// Configure CORS dynamically
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

const app: Application = express();
// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ph-healthcare-frontend-o62r.vercel.app",
      "https://ph-healthcare-frontend-poe5ipo6g-azir-uddins-projects.vercel.app",
    ],
    credentials: true,
  })
);

app.use(cookieParser());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options("*", cors());

cron.schedule("* * * * *", async () => {
  try {
    AppointmentService.cancelUnpaidAppointments();
  } catch (err) {
    console.error("Error canceling unpaid appointments:", err);
  }
});

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Ph Health Care Server is running...",
  });
});

// API routes
app.use("/api/v1", router);

// Handle 404 errors before the global error handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next({
    status: httpStatus.NOT_FOUND,
    message: "API Not Found!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
