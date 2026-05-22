-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('RETAIL', 'WHOLESALE');

-- DropIndex
DROP INDEX "cart_items_cartId_productId_key";

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "size" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "kind" "CategoryKind" NOT NULL DEFAULT 'RETAIL',
ADD COLUMN     "sizeOptions" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_productId_size_key" ON "cart_items"("cartId", "productId", "size");
