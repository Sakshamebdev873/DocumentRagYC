import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

interface CreateEmployeeDto {
  email: string;
  password: string;
  department?: string;
  createdBy: string;
}

export const createEmployee = async (data: CreateEmployeeDto) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: "EMPLOYEE",
      department: data.department || null,
      createdBy: data.createdBy,
    },
    select: {
      id: true,
      email: true,
      role: true,
      department: true,
      isActive: true,
      createdAt: true
    }
  });

  return user;
};
