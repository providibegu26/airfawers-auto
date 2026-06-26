-- CreateTable
CREATE TABLE "AttributionCarburant" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "estimation" DOUBLE PRECISION NOT NULL,
    "marge" DOUBLE PRECISION NOT NULL,
    "cout" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttributionCarburant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueConsommation" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "semaine" TEXT NOT NULL,
    "kmParcourus" INTEGER NOT NULL,
    "consommation" DOUBLE PRECISION NOT NULL,
    "cout" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueConsommation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HistoriqueConsommation_vehiculeId_semaine_key" ON "HistoriqueConsommation"("vehiculeId", "semaine");

-- AddForeignKey
ALTER TABLE "AttributionCarburant" ADD CONSTRAINT "AttributionCarburant_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueConsommation" ADD CONSTRAINT "HistoriqueConsommation_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
