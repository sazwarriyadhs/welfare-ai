-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "tagNumber" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "sex" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "healthScore" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'active',
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Animal_tagNumber_key" ON "Animal"("tagNumber");

-- CreateIndex
CREATE INDEX "Animal_status_idx" ON "Animal"("status");

-- CreateIndex
CREATE INDEX "Animal_species_idx" ON "Animal"("species");
