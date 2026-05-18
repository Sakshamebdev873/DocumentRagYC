import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_for_dev";

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !user.isActive) {
    throw new Error("Invalid credentials or inactive account");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  return { token, user: payload };
};
