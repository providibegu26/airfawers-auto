/*
  Warnings:

  - You are about to drop the column `dateAjout` on the `Vehicule` table. All the data in the column will be lost.
  - Added the required column `categorie` to the `Vehicule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicule" DROP COLUMN "dateAjout",
ADD COLUMN     "categorie" TEXT NOT NULL,
ALTER COLUMN "statut" SET DEFAULT 'non attribué';
