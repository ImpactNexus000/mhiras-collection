-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "announcementText" TEXT NOT NULL DEFAULT 'New arrivals every week — Free delivery on retail orders over ₦100,000',
ADD COLUMN     "announcementVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contactEmail" TEXT NOT NULL DEFAULT 'hello@mhirascollection.com',
ADD COLUMN     "instagramHandle" TEXT NOT NULL DEFAULT '@mhirascollection',
ADD COLUMN     "storeName" TEXT NOT NULL DEFAULT 'Mhiras Collection',
ADD COLUMN     "whatsappNumber" TEXT NOT NULL DEFAULT '+234 801 234 5678';
