-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
