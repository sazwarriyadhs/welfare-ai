
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const animals = [
    {
      tagNumber: "COW-001",
      species: "cattle",
      breed: "Friesian",
      sex: "female",
      healthScore: 92,
      status: "active",
      location: "Barn A",
    },
    {
      tagNumber: "COW-002",
      species: "cattle",
      breed: "Angus",
      sex: "male",
      healthScore: 78,
      status: "active",
      location: "Barn A",
    },
    {
      tagNumber: "GOT-001",
      species: "goat",
      breed: "Etawah",
      sex: "female",
      healthScore: 88,
      status: "active",
      location: "Pen B",
    },
    {
      tagNumber: "SHP-001",
      species: "sheep",
      breed: "Merino",
      sex: "male",
      healthScore: 64,
      status: "sick",
      location: "Pen C",
    },
  ];

  console.log("Starting animal seed...");

  for (const animal of animals) {
    await prisma.animal.upsert({
      where: {
        tagNumber: animal.tagNumber,
      },
      update: {},
      create: animal,
    });

    console.log(`Processed animal: ${animal.tagNumber}`);
  }

  console.log("Animal seed completed successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
