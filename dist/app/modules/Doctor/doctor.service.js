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
exports.DoctorService = void 0;
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const doctor_constants_1 = require("./doctor.constants");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getAllFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, gender } = filters, filterData = __rest(filters, ["searchTerm", "specialties", "gender"]);
    // console.log("object=>", specialties, gender);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: doctor_constants_1.doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    // doctor > doctorSpecialties > specialties -> title
    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialties: {
                        title: {
                            contains: specialties,
                            mode: "insensitive",
                        },
                    },
                },
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
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { averageRating: "desc" },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
            //   review: {
            //     select: {
            //       rating: true,
            //     },
            //   },
        },
    });
    const total = yield prisma_1.default.doctor.count({
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
// get by id
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
            // review: true
        },
    });
    return result;
});
//update doctor
const updateIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { specialties } = payload, doctorData = __rest(payload, ["specialties"]);
    const doctorInfo = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
        },
    });
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedDoctorData = yield transactionClient.doctor.update({
            where: {
                id,
            },
            data: doctorData,
        });
        if (specialties && specialties.length > 0) {
            const deleteSpecialtiesIds = specialties.filter((specialty) => specialty.isDeleted);
            //console.log(deleteSpecialtiesIds)
            for (const specialty of deleteSpecialtiesIds) {
                yield transactionClient.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: doctorInfo.id,
                        specialtiesId: specialty.specialtiesId,
                    },
                });
            }
            // create specialties
            const createSpecialtiesIds = specialties.filter((specialty) => !specialty.isDeleted);
            console.log(createSpecialtiesIds);
            for (const specialty of createSpecialtiesIds) {
                yield transactionClient.doctorSpecialties.create({
                    data: {
                        doctorId: doctorInfo.id,
                        specialtiesId: specialty.specialtiesId,
                    },
                });
            }
        }
    }));
    const result = yield prisma_1.default.doctor.findUnique({
        where: {
            id: doctorInfo.id,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });
    return result;
});
//delete Service
const deleteFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorDeletedData = yield transactionClient.doctor.delete({
            where: {
                id,
            },
        });
        yield transactionClient.user.delete({
            where: {
                email: doctorDeletedData.email,
            },
        });
        return doctorDeletedData;
    }));
    return result;
});
// //Soft Delete
const softDeleteFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorDeletedData = yield transactionClient.doctor.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                // name: "MashaALLAH",
            },
        });
        yield transactionClient.user.update({
            where: {
                email: doctorDeletedData.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return doctorDeletedData;
    }));
    return result;
});
exports.DoctorService = {
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    softDeleteFromDB,
};
