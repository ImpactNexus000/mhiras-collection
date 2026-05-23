-- CreateTable
CREATE TABLE "admin_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_otps_userId_idx" ON "admin_otps"("userId");

-- CreateIndex
CREATE INDEX "admin_otps_expiresAt_idx" ON "admin_otps"("expiresAt");

-- AddForeignKey
ALTER TABLE "admin_otps" ADD CONSTRAINT "admin_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
