-- AlterTable
ALTER TABLE "products" ADD COLUMN "availableSizes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
