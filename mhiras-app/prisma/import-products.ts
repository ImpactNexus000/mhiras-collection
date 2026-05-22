/**
 * Step A3 — bulk product importer.
 *
 * Reads images from ../product-images/, uploads them to Cloudinary, and
 * creates the catalogue:
 *   - Retail categories: one image file = one auto-numbered product.
 *   - Bales: one subfolder (named by bale slug) = images for that bale.
 *
 * Run:  npx tsx --env-file=.env prisma/import-products.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { uploadImage } from "../src/lib/cloudinary";
import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const IMAGES_ROOT = join(process.cwd(), "product-images");
const DEFAULT_STOCK = 10;

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

// Retail categories — slug, product price, and singular name for numbering.
const RETAIL = [
  { slug: "sexy-dresses", price: 9000, singular: "Sexy Dress" },
  { slug: "sun-dresses", price: 9000, singular: "Sun Dress" },
  { slug: "jean-gowns", price: 8500, singular: "Jean Gown" },
  { slug: "fashionable-dresses", price: 10000, singular: "Fashionable Dress" },
  { slug: "tops", price: 9000, singular: "Top" },
];

/** List image files in a directory, sorted; [] if the directory is missing. */
async function listImages(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files
      .filter((f) => MIME[extname(f).toLowerCase()])
      .sort();
  } catch {
    return [];
  }
}

/** Read a local image and upload it to Cloudinary. */
async function upload(dir: string, fileName: string) {
  const buffer = await readFile(join(dir, fileName));
  const ext = extname(fileName).toLowerCase();
  const file = new File([buffer], fileName, { type: MIME[ext] ?? "image/jpeg" });
  return uploadImage(file);
}

async function importRetailCategory(cat: (typeof RETAIL)[number]) {
  const category = await db.category.findUnique({ where: { slug: cat.slug } });
  if (!category) {
    console.log(`  ! category "${cat.slug}" not found — skipping`);
    return 0;
  }

  const dir = join(IMAGES_ROOT, cat.slug);
  const files = await listImages(dir);
  if (files.length === 0) {
    console.log(`  · ${cat.slug}: no images — skipping (placeholders kept)`);
    return 0;
  }

  // Replace whatever is currently in this category (placeholders or a prior run).
  await db.product.deleteMany({ where: { categoryId: category.id } });

  const sizesText = category.sizeOptions
    ? ` Available in sizes ${category.sizeOptions.split(",").join(", ")}.`
    : "";

  let count = 0;
  for (const fileName of files) {
    count++;
    const num = String(count).padStart(2, "0");
    const result = await upload(dir, fileName);
    await db.product.create({
      data: {
        name: `${cat.singular} ${num}`,
        slug: `${cat.slug}-${num}`,
        description: `${cat.singular} from Mhiras Collection — pre-loved and in great condition.${sizesText}`,
        categoryId: category.id,
        condition: "GOOD",
        sellingPrice: cat.price,
        stock: DEFAULT_STOCK,
        status: "PUBLISHED",
        images: {
          create: { url: result.secure_url, isPrimary: true, sortOrder: 0 },
        },
      },
    });
  }
  console.log(`  ✓ ${cat.slug}: ${count} product(s) imported`);
  return count;
}

async function importBales() {
  const baleRoot = join(IMAGES_ROOT, "bales");
  let entries;
  try {
    entries = await readdir(baleRoot, { withFileTypes: true });
  } catch {
    console.log("  · bales/: folder missing — skipping");
    return 0;
  }

  let total = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const product = await db.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`  ! bales/${slug}: no matching bale product — skipping`);
      continue;
    }

    const dir = join(baleRoot, slug);
    const files = await listImages(dir);
    if (files.length === 0) {
      console.log(`  · ${product.name}: no images — skipping`);
      continue;
    }

    // Refresh this bale's images.
    await db.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < files.length; i++) {
      const result = await upload(dir, files[i]);
      await db.productImage.create({
        data: {
          productId: product.id,
          url: result.secure_url,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }
    console.log(`  ✓ ${product.name}: ${files.length} image(s)`);
    total += files.length;
  }
  return total;
}

async function main() {
  console.log("Importing products from product-images/ ...\n");

  console.log("Retail:");
  let retailTotal = 0;
  for (const cat of RETAIL) {
    retailTotal += await importRetailCategory(cat);
  }

  console.log("\nBales:");
  const baleImages = await importBales();

  console.log(
    `\nDone — ${retailTotal} retail product(s) imported, ${baleImages} bale image(s) attached.`
  );
}

main()
  .catch((e) => {
    console.error("\nImport failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
