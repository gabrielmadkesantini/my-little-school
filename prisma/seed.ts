import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.educationLevel.upsert({
    where: { name: "Técnico" },
    update: {},
    create: {
      name: "Técnico",

      courses: {
        create: [
          {
            name: "Técnico em Informática",
            classes: {
              create: [
                {
                  name: "Técnico em Informática - 1º Ano",
                  students: {
                    create: [
                      {
                        name: "João Carfe",
                        birthDate: new Date("2000-01-01"),
                        photo: "https://bit.ly/3i4F1Qk",
                        qrCode: "https://bit.ly/3i4F1Qk",
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            name: "Enfermagem",
            classes: {
              create: [
                {
                  name: "Enfermagem - 2º Ano",
                  students: {
                    create: [
                      {
                        name: "Maria Carfe",
                        birthDate: new Date("2000-01-01"),
                        photo: "https://bit.ly/3i4F1Qk",
                        qrCode: "https://bit.ly/3i4F1Qk",
                      }
                    ]
                  }
                }
              ]
            }
          },
        ]
      },
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
