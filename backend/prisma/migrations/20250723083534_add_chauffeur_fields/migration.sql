/*
  Warnings:

  - You are about to drop the column `permisConduire` on the `Chauffeur` table. All the data in the column will be lost.
  - Added the required column `email` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postnom` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexe` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chauffeur" DROP CONSTRAINT "Chauffeur_userId_fkey";

-- AlterTable
ALTER TABLE "Chauffeur" DROP COLUMN "permisConduire",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "postnom" TEXT NOT NULL,
ADD COLUMN     "prenom" TEXT NOT NULL,
ADD COLUMN     "sexe" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
