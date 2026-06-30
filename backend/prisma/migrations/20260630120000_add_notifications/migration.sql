-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "destinataireRole" TEXT NOT NULL,
    "destinataireUserId" INTEGER,
    "chauffeurId" INTEGER,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "luLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_destinataireRole_lu_idx" ON "Notification"("destinataireRole", "lu");

-- CreateIndex
CREATE INDEX "Notification_destinataireUserId_idx" ON "Notification"("destinataireUserId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
