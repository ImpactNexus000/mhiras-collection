import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Categories
  const categories = await Promise.all(
    [
      { name: "Dresses", slug: "dresses", sortOrder: 1 },
      { name: "Tops", slug: "tops", sortOrder: 2 },
      { name: "Bottoms", slug: "bottoms", sortOrder: 3 },
      { name: "Jackets & Blazers", slug: "jackets-blazers", sortOrder: 4 },
      { name: "Bags", slug: "bags", sortOrder: 5 },
      { name: "Shoes", slug: "shoes", sortOrder: 6 },
      { name: "Knitwear", slug: "knitwear", sortOrder: 7 },
      { name: "Accessories", slug: "accessories", sortOrder: 8 },
    ].map((cat) =>
      db.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // Products
  const products = [
    {
      name: "Vintage Wrap Dress",
      slug: "vintage-wrap-dress",
      description:
        "Beautiful wrap dress in a burgundy floral print. Fully lined, midi length. Excellent pre-loved condition — no stains, no tears. A true vintage find.",
      categoryId: catMap["dresses"],
      size: "M",
      condition: "LIKE_NEW" as const,
      sellingPrice: 8500,
      originalPrice: 22000,
      stock: 1,
      status: "PUBLISHED" as const,
      featured: true,
    },
    {
      name: "Midi Floral Dress",
      slug: "midi-floral-dress",
      description:
        "Elegant midi dress with delicate floral patterns. Lightweight fabric perfect for Lagos weather. Slight stretch for a comfortable fit.",
      categoryId: catMap["dresses"],
      size: "M",
      condition: "LIKE_NEW" as const,
      sellingPrice: 7000,
      originalPrice: 22000,
      stock: 3,
      status: "PUBLISHED" as const,
      featured: true,
    },
    {
      name: "Slip Midi Dress",
      slug: "slip-midi-dress",
      description:
        "Minimalist satin slip dress. Adjustable straps, bias cut. Versatile piece that can be dressed up or down.",
      categoryId: catMap["dresses"],
      size: "XS",
      condition: "GOOD" as const,
      sellingPrice: 6000,
      originalPrice: 15000,
      stock: 2,
      status: "PUBLISHED" as const,
    },
    {
      name: "Floral Wrap Dress",
      slug: "floral-wrap-dress",
      description:
        "Classic wrap silhouette in a bold floral print. True to size with a tie waist.",
      categoryId: catMap["dresses"],
      size: "M",
      condition: "GOOD" as const,
      sellingPrice: 10000,
      originalPrice: null,
      stock: 0,
      status: "PUBLISHED" as const,
    },
    {
      name: "Linen Button-Up",
      slug: "linen-button-up",
      description:
        "Relaxed-fit linen shirt. Breathable and lightweight. Perfect for layering or wearing alone.",
      categoryId: catMap["tops"],
      size: "S",
      condition: "GOOD" as const,
      sellingPrice: 4500,
      originalPrice: null,
      stock: 2,
      status: "PUBLISHED" as const,
    },
    {
      name: "Silk Blouse — Cream",
      slug: "silk-blouse-cream",
      description:
        "Luxurious silk blouse in cream. Subtle sheen, French cuffs. Dry clean recommended.",
      categoryId: catMap["tops"],
      size: "S",
      condition: "LIKE_NEW" as const,
      sellingPrice: 5200,
      originalPrice: 12000,
      stock: 0,
      status: "PUBLISHED" as const,
    },
    {
      name: "Oxford Shirt — Navy",
      slug: "oxford-shirt-navy",
      description:
        "Men's classic oxford button-down in navy. 100% cotton, excellent quality. No visible wear.",
      categoryId: catMap["tops"],
      size: "L",
      condition: "GOOD" as const,
      sellingPrice: 5500,
      originalPrice: null,
      stock: 3,
      status: "PUBLISHED" as const,
    },
    {
      name: "Satin Blouse — Black",
      slug: "satin-blouse-black",
      description:
        "Elegant black satin blouse with subtle draping. Perfect for a night out or office wear.",
      categoryId: catMap["tops"],
      size: "M",
      condition: "LIKE_NEW" as const,
      sellingPrice: 6800,
      originalPrice: 16000,
      stock: 1,
      status: "PUBLISHED" as const,
    },
    {
      name: "Structured Handbag",
      slug: "structured-handbag",
      description:
        "Timeless structured handbag in tan leather. Gold hardware, interior pockets. Minor scuff on base — priced to reflect.",
      categoryId: catMap["bags"],
      size: null,
      condition: "GOOD" as const,
      sellingPrice: 11000,
      originalPrice: 28000,
      stock: 1,
      status: "PUBLISHED" as const,
      featured: true,
    },
    {
      name: "Leather Tote — Brown",
      slug: "leather-tote-brown",
      description:
        "Spacious leather tote in rich brown. Perfect everyday bag. Fits a 13-inch laptop comfortably.",
      categoryId: catMap["bags"],
      size: null,
      condition: "LIKE_NEW" as const,
      sellingPrice: 14000,
      originalPrice: 35000,
      stock: 2,
      status: "PUBLISHED" as const,
    },
    {
      name: "Leather Crossbody Bag",
      slug: "leather-crossbody-bag",
      description:
        "Compact crossbody in genuine leather. Adjustable strap, zip closure. Ideal for going out.",
      categoryId: catMap["bags"],
      size: null,
      condition: "GOOD" as const,
      sellingPrice: 14000,
      originalPrice: null,
      stock: 1,
      status: "PUBLISHED" as const,
    },
    {
      name: "Block Heel Mules",
      slug: "block-heel-mules",
      description:
        "Tan block heel mules. Comfortable 2.5-inch heel. Leather upper, cushioned insole.",
      categoryId: catMap["shoes"],
      size: "40",
      condition: "GOOD" as const,
      sellingPrice: 9500,
      originalPrice: 24000,
      stock: 4,
      status: "PUBLISHED" as const,
    },
    {
      name: "Vintage Denim Jacket",
      slug: "vintage-denim-jacket",
      description:
        "Classic oversized denim jacket. Authentic vintage wash. Two chest pockets, brass buttons.",
      categoryId: catMap["jackets-blazers"],
      size: "M",
      condition: "LIKE_NEW" as const,
      sellingPrice: 12000,
      originalPrice: null,
      stock: 1,
      status: "PUBLISHED" as const,
      featured: true,
    },
    {
      name: "Oversized Linen Blazer",
      slug: "oversized-linen-blazer",
      description:
        "Relaxed fit linen blazer in oatmeal. Single button closure. Unlined — perfect for warm weather.",
      categoryId: catMap["jackets-blazers"],
      size: "L",
      condition: "LIKE_NEW" as const,
      sellingPrice: 15000,
      originalPrice: null,
      stock: 1,
      status: "PUBLISHED" as const,
    },
    {
      name: "Wide-Leg Trousers",
      slug: "wide-leg-trousers",
      description:
        "High-waisted wide-leg trousers in charcoal. Flattering drape, side zip. Pair with any top.",
      categoryId: catMap["bottoms"],
      size: "S",
      condition: "LIKE_NEW" as const,
      sellingPrice: 9000,
      originalPrice: null,
      stock: 2,
      status: "PUBLISHED" as const,
    },
    {
      name: "Pleated Maxi Skirt",
      slug: "pleated-maxi-skirt",
      description:
        "Flowing pleated maxi skirt in olive green. Elastic waist, fully lined.",
      categoryId: catMap["bottoms"],
      size: "M",
      condition: "GOOD" as const,
      sellingPrice: 11500,
      originalPrice: null,
      stock: 0,
      status: "PUBLISHED" as const,
    },
    {
      name: "Cashmere Cardigan",
      slug: "cashmere-cardigan",
      description:
        "Soft cashmere blend cardigan in dusty rose. Light pilling — reflected in price. Still incredibly soft.",
      categoryId: catMap["knitwear"],
      size: "M",
      condition: "FAIR" as const,
      sellingPrice: 7500,
      originalPrice: null,
      stock: 1,
      status: "PUBLISHED" as const,
    },
    {
      name: "Corduroy Jacket",
      slug: "corduroy-jacket",
      description:
        "Warm corduroy jacket in forest green. Two front pockets, button closure. Great transitional piece.",
      categoryId: catMap["jackets-blazers"],
      size: "L",
      condition: "GOOD" as const,
      sellingPrice: 10500,
      originalPrice: 20000,
      stock: 2,
      status: "PUBLISHED" as const,
    },
  ];

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

  console.log("Seeded: 8 categories, 18 products, 3 collections, 6 delivery zones");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
