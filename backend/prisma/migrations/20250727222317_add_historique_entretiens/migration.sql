-- CreateTable
CREATE TABLE "HistoriqueEntretien" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "description" TEXT,
    "dateEffectuee" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueEntretien_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoriqueEntretien" ADD CONSTRAINT "HistoriqueEntretien_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
