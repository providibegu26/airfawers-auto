-- AlterTable
ALTER TABLE "User" ADD COLUMN "doitChangerMotDePasse" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Chauffeur" ADD COLUMN "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN "typeCarburant" TEXT NOT NULL DEFAULT 'ESSENCE';
