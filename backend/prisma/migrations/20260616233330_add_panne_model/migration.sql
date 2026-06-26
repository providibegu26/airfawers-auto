-- CreateTable
CREATE TABLE "Panne" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "chauffeurId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "niveauGravite" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "localisation" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "notesAdmin" TEXT,
    "dateSignalement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateResolution" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panne_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
