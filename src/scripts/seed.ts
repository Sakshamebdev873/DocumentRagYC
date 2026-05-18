import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminEmail = "admin@enterprise.com";
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log("Admin user already exists. Skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash("securepassword123", 10);
  
  await prisma.user.create({
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
    await prisma.$disconnect();
  });
