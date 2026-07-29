-- Recreate Admin table (dropped in 20250808170313)
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "postNom" TEXT,
    "telephone" TEXT,
    "photo" TEXT,
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
