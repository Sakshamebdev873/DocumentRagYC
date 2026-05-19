"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDocumentVisibilitySchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
exports.createEmployeeSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    department: zod_1.z.string().optional(),
});
exports.assignDocumentVisibilitySchema = zod_1.z.object({
    visibleToUserIds: zod_1.z.array(zod_1.z.string().min(1)).default([]),
});
