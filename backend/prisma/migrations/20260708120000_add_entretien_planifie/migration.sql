-- CreateTable
CREATE TABLE "EntretienPlanifie" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "datePrevue" TIMESTAMP(3) NOT NULL,
    "seuilKm" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'planifie',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntretienPlanifie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntretienPlanifie_vehiculeId_type_seuilKm_key" ON "EntretienPlanifie"("vehiculeId", "type", "seuilKm");

-- CreateIndex
CREATE INDEX "EntretienPlanifie_datePrevue_idx" ON "EntretienPlanifie"("datePrevue");

-- CreateIndex
CREATE INDEX "EntretienPlanifie_statut_idx" ON "EntretienPlanifie"("statut");

-- AddForeignKey
ALTER TABLE "EntretienPlanifie" ADD CONSTRAINT "EntretienPlanifie_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
