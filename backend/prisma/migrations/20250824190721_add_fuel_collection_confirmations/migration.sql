-- CreateTable
CREATE TABLE "ConfirmationRecuperationCarburant" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "attributionCarburantId" INTEGER NOT NULL,
    "chauffeurId" INTEGER NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "dateConfirmation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfirmationRecuperationCarburant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConfirmationRecuperationCarburant" ADD CONSTRAINT "ConfirmationRecuperationCarburant_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationRecuperationCarburant" ADD CONSTRAINT "ConfirmationRecuperationCarburant_attributionCarburantId_fkey" FOREIGN KEY ("attributionCarburantId") REFERENCES "AttributionCarburant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationRecuperationCarburant" ADD CONSTRAINT "ConfirmationRecuperationCarburant_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
