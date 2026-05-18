"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployee = void 0;
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createEmployee = async (data) => {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: data.email }
    });
    if (existingUser) {
        throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    const user = await prisma_1.prisma.user.create({
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
exports.createEmployee = createEmployee;
