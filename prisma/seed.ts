import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.educationLevel.upsert({
    where: { name: "Técnico" },
    update: {},
    create: {
      name: "Técnico",
    },
  });
  await prisma.educationLevel.upsert({
    where: { name: "Subsequente" },
    update: {},
    create: {
      name: "Subsequente",
    },
  });
  await prisma.educationLevel.upsert({
    where: { name: "Graduação" },
    update: {},
    create: {
      name: "Graduação",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
