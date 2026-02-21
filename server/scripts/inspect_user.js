const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const emails = ["manager@fleetops.com", "dispatcher@fleetops.com"];
  for (const email of emails) {
    const u = await prisma.user.findUnique({ where: { email } });
    console.log(email, !!u, u && u.passwordHash && u.passwordHash.slice(0, 10));
  }
}
main().finally(() => prisma.$disconnect());
