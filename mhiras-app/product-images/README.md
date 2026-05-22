# Product images — drop zone for Step A3

Drop Mhiras's product photos into the folders below, then run the importer:

```
npx tsx --env-file=.env prisma/import-products.ts
```

The importer uploads every image to Cloudinary and creates/updates the
products in the database.

## Retail categories — one image = one product

Drop image files directly into each folder. Each file becomes one product,
auto-numbered in filename order (`Sexy Dress 01`, `Sexy Dress 02`, …).

| Folder                  | Becomes            | Price   |
|-------------------------|--------------------|---------|
| `sexy-dresses/`         | Sexy Dress NN      | ₦9,000  |
| `sun-dresses/`          | Sun Dress NN       | ₦9,000  |
| `jean-gowns/`           | Jean Gown NN       | ₦8,500  |
| `fashionable-dresses/`  | Fashionable Dress NN | ₦10,000 |
| `tops/`                 | Top NN             | ₦9,000  |

Running the importer **replaces** all products currently in these categories
(including the placeholders), so re-running it is safe.

## Bales — one subfolder = one bale

Each bale already exists as a product. Drop one or more photos into the
matching subfolder under `bales/`. The first image (alphabetically) becomes
the primary photo.

- `bales/premium-boutique-standard-poly-dress-bale/`
- `bales/ladies-mini-dress-bale/`
- `bales/ladies-party-gown-bale/`
- `bales/premium-poly-dress-bale/`
- `bales/china-jean-gown-bale/`
- `bales/polo-dress-bale/`
- `bales/poly-blouse-bale/`
- `bales/budget-friendly-polo-dress-bale/`

## Notes

- Accepted formats: JPG, PNG, WebP, AVIF. Keep each file under ~5 MB.
- Empty folders are skipped — you can import categories in batches.
- These local files are only the source; the live images live on Cloudinary.
