"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_for_dev";
const login = async (email, password) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
        throw new Error("Invalid credentials or inactive account");
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        throw new Error("Invalid credentials");
    }
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "1d" });
    return { token, user: payload };
};
exports.login = login;
