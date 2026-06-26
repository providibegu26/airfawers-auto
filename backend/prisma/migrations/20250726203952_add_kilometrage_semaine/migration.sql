/*
  Warnings:

  - You are about to drop the column `email` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `postnom` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `sexe` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `datePrevue` on the `Entretien` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Entretien` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `Entretien` table. All the data in the column will be lost.
  - You are about to drop the column `dateCreation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Carburant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtpToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Panne` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `userId` on table `Chauffeur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateEffectuee` on table `Entretien` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Carburant" DROP CONSTRAINT "Carburant_chauffeurId_fkey";

-- DropForeignKey
ALTER TABLE "Carburant" DROP CONSTRAINT "Carburant_vehiculeId_fkey";

-- DropForeignKey
ALTER TABLE "Chauffeur" DROP CONSTRAINT "Chauffeur_userId_fkey";

-- DropForeignKey
ALTER TABLE "Entretien" DROP CONSTRAINT "Entretien_vehiculeId_fkey";

-- DropForeignKey
ALTER TABLE "OtpToken" DROP CONSTRAINT "OtpToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Panne" DROP CONSTRAINT "Panne_chauffeurId_fkey";

-- DropForeignKey
ALTER TABLE "Panne" DROP CONSTRAINT "Panne_vehiculeId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicule" DROP CONSTRAINT "Vehicule_chauffeurId_fkey";

-- AlterTable
ALTER TABLE "Chauffeur" DROP COLUMN "email",
DROP COLUMN "postnom",
DROP COLUMN "sexe",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateEmbauche" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statut" TEXT NOT NULL DEFAULT 'actif',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Entretien" DROP COLUMN "datePrevue",
DROP COLUMN "notes",
DROP COLUMN "statut",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dateEffectuee" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dateCreation",
DROP COLUMN "nom",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "role" SET DEFAULT 'chauffeur';

-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "annee" INTEGER NOT NULL DEFAULT 2024,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateAjout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "kilometrage" SET DEFAULT 0,
ALTER COLUMN "statut" SET DEFAULT 'disponible',
ALTER COLUMN "categorie" SET DEFAULT 'LIGHT';

-- DropTable
DROP TABLE "Carburant";

-- DropTable
DROP TABLE "OtpToken";

-- DropTable
DROP TABLE "Panne";

-- CreateTable
CREATE TABLE "KilometrageSemaine" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "dateMiseAJour" TIMESTAMP(3) NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "weeklyKm" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KilometrageSemaine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entretien" ADD CONSTRAINT "Entretien_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KilometrageSemaine" ADD CONSTRAINT "KilometrageSemaine_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
