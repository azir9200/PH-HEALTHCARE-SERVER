import { Request } from "express";
import prisma from "../../../shared/prisma";
import { IFile } from "../../interfaces/file";
import { Specialties } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";

const insertIntoDB = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });
  console.log(result);

  return result;
};

const getAllFromDB = async (): Promise<Specialties[]> => {
  return await prisma.specialties.findMany();
};
const getByIdFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.findUniqueOrThrow({
    where: {
      id: id,
    },
  });
  return result;
};
const updateIntoDB = async (
  id: string,
  data: Partial<Specialties>
): Promise<Specialties> => {
  await prisma.specialties.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.specialties.update({
    where: {
      id,
    },
    data,
  });

  return result;
};

const deleteFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesService = {
  insertIntoDB,
  getAllFromDB,
  deleteFromDB,
  getByIdFromDB,
  updateIntoDB,
};
