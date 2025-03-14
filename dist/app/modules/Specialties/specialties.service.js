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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialtiesService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const insertIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.icon = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const result = yield prisma_1.default.specialties.create({
        data: req.body,
    });
    console.log(result);
    return result;
});
const getAllFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.specialties.findMany();
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.specialties.findUniqueOrThrow({
        where: {
            id: id,
        },
    });
    return result;
});
const updateIntoDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.specialties.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.specialties.update({
        where: {
            id,
        },
        data,
    });
    return result;
});
const deleteFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.specialties.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.SpecialtiesService = {
    insertIntoDB,
    getAllFromDB,
    deleteFromDB,
    getByIdFromDB,
    updateIntoDB,
};
