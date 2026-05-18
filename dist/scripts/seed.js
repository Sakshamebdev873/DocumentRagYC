"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function main() {
    const adminEmail = "admin@enterprise.com";
    const existingAdmin = await prisma_1.prisma.user.findUnique({
        where: { email: adminEmail }
    });
    if (existingAdmin) {
        console.log("Admin user already exists. Skipping seed.");
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash("securepassword123", 10);
    await prisma_1.prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
            department: "SYSTEM", // Default department for system admin
            isActive: true,
        }
    });
    console.log(`Successfully seeded initial admin: ${adminEmail} (password: securepassword123)`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
