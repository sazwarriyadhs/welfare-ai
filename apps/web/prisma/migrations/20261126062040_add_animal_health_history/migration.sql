-- CreateTable
CREATE TABLE "AnimalHealthHistory" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnimalHealthHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnimalHealthHistory_animalId_recordedAt_idx" ON "AnimalHealthHistory"("animalId", "recordedAt");

-- CreateIndex
CREATE INDEX "AnimalHealthHistory_recordedAt_idx" ON "AnimalHealthHistory"("recordedAt");

-- AddForeignKey
ALTER TABLE "AnimalHealthHistory" ADD CONSTRAINT "AnimalHealthHistory_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
