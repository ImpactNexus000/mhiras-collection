-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpires" TIMESTAMP(3);

-- Grandfather admin accounts so they aren't locked out by the new check.
UPDATE "users" SET "emailVerified" = NOW() WHERE "role" = 'ADMIN' AND "emailVerified" IS NULL;
