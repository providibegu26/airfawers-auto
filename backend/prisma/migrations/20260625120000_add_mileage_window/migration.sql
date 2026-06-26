-- CreateTable
CREATE TABLE "FenetreMiseAJourKilometrage" (
    "id" SERIAL NOT NULL,
    "semaine" TEXT NOT NULL,
    "ouverte" BOOLEAN NOT NULL DEFAULT false,
    "ouverteLe" TIMESTAMP(3),
    "fermeeLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FenetreMiseAJourKilometrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaisieKilometrageChauffeur" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "chauffeurId" INTEGER NOT NULL,
    "semaine" TEXT NOT NULL,
    "kilometrageAvant" INTEGER NOT NULL,
    "kilometrageApres" INTEGER NOT NULL,
    "kmParcourus" INTEGER NOT NULL,
    "dateSaisie" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaisieKilometrageChauffeur_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "HistoriqueConsommation" ADD COLUMN "kilometrageAvant" INTEGER,
ADD COLUMN "kilometrageApres" INTEGER,
ADD COLUMN "source" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FenetreMiseAJourKilometrage_semaine_key" ON "FenetreMiseAJourKilometrage"("semaine");

-- CreateIndex
CREATE UNIQUE INDEX "SaisieKilometrageChauffeur_vehiculeId_semaine_key" ON "SaisieKilometrageChauffeur"("vehiculeId", "semaine");

-- AddForeignKey
ALTER TABLE "SaisieKilometrageChauffeur" ADD CONSTRAINT "SaisieKilometrageChauffeur_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaisieKilometrageChauffeur" ADD CONSTRAINT "SaisieKilometrageChauffeur_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
