import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Categories — Mhiras Collection's real catalog structure.
  // RETAIL = individual dresses sold by size; WHOLESALE = bulk bales.
  const categoryData: {
    name: string;
    slug: string;
    kind: "RETAIL" | "WHOLESALE";
    sizeOptions: string | null;
    sortOrder: number;
    description: string | null;
  }[] = [
    {
      name: "Sexy Dresses",
      slug: "sexy-dresses",
      kind: "RETAIL",
      sizeOptions: "6,8,10",
      sortOrder: 1,
      description: null,
    },
    {
      name: "Sun Dresses",
      slug: "sun-dresses",
      kind: "RETAIL",
      sizeOptions: "6,8,10,12",
      sortOrder: 2,
      description: null,
    },
    {
      name: "Jean Gowns",
      slug: "jean-gowns",
      kind: "RETAIL",
      sizeOptions: "8,10,12,14",
      sortOrder: 3,
      description: null,
    },
    {
      name: "Fashionable Dresses",
      slug: "fashionable-dresses",
      kind: "RETAIL",
      sizeOptions: "8,10,12,14,16",
      sortOrder: 4,
      description: null,
    },
    {
      name: "Tops",
      slug: "tops",
      kind: "RETAIL",
      sizeOptions: "8,10,12,14,18,20",
      sortOrder: 5,
      description: null,
    },
    {
      name: "Bales",
      slug: "bales",
      kind: "WHOLESALE",
      sizeOptions: null,
      sortOrder: 6,
      description: "Wholesale bulk lots — UK ~55kg bales for resellers.",
    },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      db.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          kind: cat.kind,
          sizeOptions: cat.sizeOptions,
          sortOrder: cat.sortOrder,
          description: cat.description,
        },
        create: cat,
      })
    )
  );

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // Bales — real wholesale products supplied by the client.
  const bales = [
    {
      name: "Premium Boutique Standard Poly Dress Bale",
      slug: "premium-boutique-standard-poly-dress-bale",
      description: "Premium boutique-standard poly dress bale. UK ~55kg.",
      sellingPrice: 730000,
      weight: 55,
      featured: true,
    },
    {
      name: "Ladies Mini Dress Bale",
      slug: "ladies-mini-dress-bale",
      description: "Ladies mini dress bale.",
      sellingPrice: 430000,
      weight: null,
      featured: false,
    },
    {
      name: "Ladies Party Gown Bale",
      slug: "ladies-party-gown-bale",
      description: "Ladies party gown bale. ~55kg.",
      sellingPrice: 385000,
      weight: 55,
      featured: false,
    },
    {
      name: "Premium Poly Dress Bale",
      slug: "premium-poly-dress-bale",
      description: "Premium poly dress bale. UK ~55kg.",
      sellingPrice: 460000,
      weight: 55,
      featured: false,
    },
    {
      name: "China Jean Gown Bale",
      slug: "china-jean-gown-bale",
      description: "China jean gown bale.",
      sellingPrice: 410000,
      weight: null,
      featured: false,
    },
    {
      name: "Polo Dress Bale",
      slug: "polo-dress-bale",
      description: "Polo dress bale. UK ~55kg.",
      sellingPrice: 420000,
      weight: 55,
      featured: false,
    },
    {
      name: "Poly Blouse Bale",
      slug: "poly-blouse-bale",
      description: "Poly blouse bale.",
      sellingPrice: 420000,
      weight: null,
      featured: false,
    },
    {
      name: "Budget Friendly Polo Dress Bale",
      slug: "budget-friendly-polo-dress-bale",
      description: "Budget-friendly polo dress bale. UK ~55kg.",
      sellingPrice: 270000,
      weight: 55,
      featured: true,
    },
  ];

  // Retail products are loaded from real photos via prisma/import-products.ts
  // (Step A3) — the seed only creates the bale catalogue.
  const products: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    size: string | null;
    condition: "LIKE_NEW" | "GOOD" | "FAIR";
    sellingPrice: number;
    originalPrice: number | null;
    stock: number;
    weight: number | null;
    status: "PUBLISHED";
    featured: boolean;
  }[] = [];

  for (const bale of bales) {
    products.push({
      name: bale.name,
      slug: bale.slug,
      description: bale.description,
      categoryId: catMap["bales"],
      size: null,
      condition: "GOOD",
      sellingPrice: bale.sellingPrice,
      originalPrice: null,
      stock: 3,
      weight: bale.weight,
      status: "PUBLISHED",
      featured: bale.featured,
    });
  }

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  // Collections
  await db.collection.upsert({
    where: { slug: "date-night" },
    update: {},
    create: {
      name: "Date Night Edit",
      slug: "date-night",
      description: "Curated looks for a memorable evening out.",
      sortOrder: 1,
    },
  });

  await db.collection.upsert({
    where: { slug: "office-essentials" },
    update: {},
    create: {
      name: "Office Essentials",
      slug: "office-essentials",
      description: "Polished pre-loved pieces that mean business.",
      sortOrder: 2,
    },
  });

  await db.collection.upsert({
    where: { slug: "weekend-casual" },
    update: {},
    create: {
      name: "Weekend Casual",
      slug: "weekend-casual",
      description: "Relaxed fits for your days off.",
      sortOrder: 3,
    },
  });

  // Delivery zones
  const zones = [
    { name: "Lagos Island", states: "Lagos", fee: 1500, estimateDays: "1-2 days", sortOrder: 1 },
    { name: "Lagos Mainland", states: "Lagos", fee: 2000, estimateDays: "1-2 days", sortOrder: 2 },
    { name: "Abuja", states: "FCT", fee: 3500, estimateDays: "2-4 days", sortOrder: 3 },
    { name: "South-West", states: "Oyo,Ogun,Ondo,Osun,Ekiti", fee: 3000, estimateDays: "3-5 days", sortOrder: 4 },
    { name: "South-East / South-South", states: "Rivers,Enugu,Delta,Edo,Anambra,Abia,Imo,Cross River,Akwa Ibom,Bayelsa,Ebonyi", fee: 4000, estimateDays: "3-5 days", sortOrder: 5 },
    { name: "North", states: "Kano,Kaduna,Katsina,Sokoto,Zamfara,Kebbi,Jigawa,Bauchi,Gombe,Yobe,Borno,Adamawa,Taraba,Plateau,Nasarawa,Niger,Benue,Kogi,Kwara", fee: 5000, estimateDays: "5-7 days", sortOrder: 6 },
  ];

  for (const zone of zones) {
    const existing = await db.deliveryZone.findFirst({
      where: { name: zone.name },
    });
    if (!existing) {
      await db.deliveryZone.create({ data: zone });
    }
  }

  // Promo codes
  const promos = [
    {
      code: "WELCOME10",
      discountType: "PERCENTAGE" as const,
      discountValue: 10,
      minOrder: null,
      maxUses: null,
      isActive: true,
    },
    {
      code: "SAVE2K",
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 2000,
      minOrder: 10000,
      maxUses: null,
      isActive: true,
    },
    {
      code: "FREESHIP",
      discountType: "FREE_DELIVERY" as const,
      discountValue: 0,
      minOrder: null,
      maxUses: null,
      isActive: true,
    },
  ];

  for (const promo of promos) {
    await db.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }

  // Store settings — singleton row holding admin-configurable values.
  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", stockpileExpiryDays: 30 },
  });

  console.log(
    `Seeded: ${categoryData.length} categories, ${products.length} products, 3 collections, ${zones.length} delivery zones, ${promos.length} promo codes`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
