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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const createAppointment = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const patientData = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
        },
    });
    console.log("azi", doctorData);
    const doctorSchedule = yield prisma_1.default.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: doctorData.id,
            scheduleId: payload.scheduleId,
            isBooked: true,
        },
    });
    console.log("doctor", doctorSchedule);
    const videoCallingId = (0, uuid_1.v4)();
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentData = yield tx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId,
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true,
            },
        });
        // console.log("appointment data", appointmentData);
        yield tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId,
                },
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData.id,
            },
        });
        // PH-HealthCare-dataTime
        const today = new Date();
        const transactionId = "PH-HealthCare-" +
            today.getFullYear() +
            "-" +
            today.getMonth() +
            "-" +
            today.getDay() +
            "-" +
            today.getHours() +
            "-" +
            today.getMinutes();
        const payInfo = yield tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId,
            },
        });
        // console.log("PayInfo", payInfo);
        return appointmentData;
    }));
    return result;
});
const getMyAppointment = (user, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const filterData = __rest(filters, []);
    const andConditions = [];
    if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    else if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key],
            },
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
        include: (user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.PATIENT
            ? { doctor: true, schedule: true }
            : {
                patient: {
                    include: { medicalReport: true, patientHealthData: true },
                },
                schedule: true,
            },
    });
    const total = yield prisma_1.default.appointment.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getAllFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { patientEmail, doctorEmail } = filters, filterData = __rest(filters, ["patientEmail", "doctorEmail"]);
    const andConditions = [];
    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail,
            },
        });
    }
    else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail,
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: filterData[key],
                    },
                };
            }),
        });
    }
    // console.dir(andConditions, { depth: Infinity })
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: "desc",
            },
        include: {
            doctor: true,
            patient: true,
        },
    });
    const total = yield prisma_1.default.appointment.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const changeAppointmentStatus = (appointmentId, status, user) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentData = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true,
        },
    });
    if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "This is not your appointment!");
        }
    }
    const result = yield prisma_1.default.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status,
        },
    });
    return result;
});
const cancelUnpaidAppointments = () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyMinAgo = new Date(Date.now() - 1 * 60 * 1000);
    const unPaidAppointments = yield prisma_1.default.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo,
            },
            paymentStatus: client_1.PaymentStatus.UNPAID,
        },
    });
    const appointmentIdsToCancel = unPaidAppointments.map((appointment) => appointment.id);
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel,
                },
            },
        });
        yield tx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel,
                },
            },
        });
        for (const upPaidAppointment of unPaidAppointments) {
            yield tx.doctorSchedules.updateMany({
                where: {
                    doctorId: upPaidAppointment.doctorId,
                    scheduleId: upPaidAppointment.scheduleId,
                },
                data: {
                    isBooked: false,
                },
            });
        }
    }));
});
exports.AppointmentService = {
    createAppointment,
    getMyAppointment,
    getAllFromDB,
    changeAppointmentStatus,
    cancelUnpaidAppointments,
};
