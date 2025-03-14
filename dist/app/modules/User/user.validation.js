"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createAdmin = zod_1.z.object({
    password: zod_1.z.string({
        required_error: "Password is required",
    }),
    admin: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "Name is required!",
        }),
        email: zod_1.z.string({
            required_error: "Email is required!",
        }),
        contactNumber: zod_1.z.string({
            required_error: "Contact Number is required!",
        }),
    }),
});
const createDoctor = zod_1.z.object({
    password: zod_1.z.string({
        required_error: "Password is required",
    }),
    doctor: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "Name is required!",
        }),
        email: zod_1.z.string({
            required_error: "Email is required!",
        }),
        contactNumber: zod_1.z.string({
            required_error: "Contact Number is required!",
        }),
        address: zod_1.z.string().optional(),
        registrationNumber: zod_1.z.string({
            required_error: "Reg number is required",
        }),
        experience: zod_1.z.number().optional(),
        gender: zod_1.z.enum([client_1.Gender.MALE, client_1.Gender.FEMALE]),
        appointmentFee: zod_1.z.number({
            required_error: "appointment fee is required",
        }),
        qualification: zod_1.z.string({
            required_error: "quilification is required",
        }),
        currentWorkingPlace: zod_1.z.string({
            required_error: "Current working place is required!",
        }),
        designation: zod_1.z.string({
            required_error: "Designation is required!",
        }),
    }),
});
const createPatient = zod_1.z.object({
    password: zod_1.z.string(),
    patient: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: "Email is required!",
        })
            .email(),
        name: zod_1.z.string({
            required_error: "Name is required!",
        }),
        contactNumber: zod_1.z.string({
            required_error: "Contact number is required!",
        }),
        address: zod_1.z.string({
            required_error: "Address is required",
        }),
    }),
});
const updateStatus = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([client_1.UserStatus.ACTIVE, client_1.UserStatus.BLOCKED, client_1.UserStatus.DELETED]),
    }),
});
exports.userValidation = {
    createAdmin,
    createDoctor,
    createPatient,
    updateStatus,
};
