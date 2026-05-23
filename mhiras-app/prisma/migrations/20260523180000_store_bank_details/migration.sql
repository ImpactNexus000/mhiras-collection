-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "bankAccountName" TEXT NOT NULL DEFAULT 'Mhiras Collection',
ADD COLUMN     "bankAccountNumber" TEXT NOT NULL DEFAULT '0123456789',
ADD COLUMN     "bankName" TEXT NOT NULL DEFAULT 'GTBank';
