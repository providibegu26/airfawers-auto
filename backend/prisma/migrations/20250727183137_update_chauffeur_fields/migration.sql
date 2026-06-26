/*
  Warnings:

  - You are about to drop the column `adresse` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the `Entretien` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KilometrageSemaine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Entretien" DROP CONSTRAINT "Entretien_vehiculeId_fkey";

-- DropForeignKey
ALTER TABLE "KilometrageSemaine" DROP CONSTRAINT "KilometrageSemaine_vehiculeId_fkey";

-- AlterTable
ALTER TABLE "Chauffeur" DROP COLUMN "adresse",
ADD COLUMN     "postnom" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "sexe" TEXT NOT NULL DEFAULT 'Masculin';

-- DropTable
DROP TABLE "Entretien";

-- DropTable
DROP TABLE "KilometrageSemaine";
