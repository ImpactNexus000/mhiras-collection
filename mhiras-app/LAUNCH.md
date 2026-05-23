# Launch Checklist

Things that **must** be true before flipping mhirascollection.com live. Work
top to bottom — each section is independent.

## 1. Environment variables (production)

Set on Vercel (Project → Settings → Environment Variables). Anything marked
**required** will leave the site broken or insecure if missing.

| Variable                       | Required | Notes                                                                 |
| ------------------------------ | -------- | --------------------------------------------------------------------- |
| `DATABASE_URL`                 | ✅       | Production Neon branch — not the dev one                              |
| `NEXT_PUBLIC_APP_URL`          | ✅       | `https://mhirascollection.com` (no trailing slash). Powers SEO + canonical URLs + Paystack callback |
| `AUTH_SECRET`                  | ✅       | Generate fresh: `openssl rand -base64 32`. Do not reuse the dev placeholder |
| `AUTH_URL`                     | ✅       | Same as `NEXT_PUBLIC_APP_URL`                                         |
| `PAYSTACK_SECRET_KEY`          | ✅       | **Live key** (`sk_live_…`), not the test key                          |
| `PAYSTACK_PUBLIC_KEY`          | ✅       | **Live key** (`pk_live_…`)                                            |
| `CLOUDINARY_CLOUD_NAME`        | ✅       | Already configured                                                    |
| `CLOUDINARY_API_KEY`           | ✅       | Already configured                                                    |
| `CLOUDINARY_API_SECRET`        | ✅       | Already configured                                                    |
| `RESEND_API_KEY`               | ✅       | From https://resend.com/api-keys                                      |
| `EMAIL_FROM`                   | ✅       | e.g. `Mhiras Collection <orders@mhirascollection.com>` — see §4       |
| `ADMIN_EMAIL`                  | ✅       | Mhiras's inbox — receives new stockpile delivery requests             |
| `UPSTASH_REDIS_REST_URL`       | ✅       | From https://upstash.com — see §5                                     |
| `UPSTASH_REDIS_REST_TOKEN`     | ✅       | Paired with the URL above                                             |
| `AUTH_GOOGLE_ID`               | optional | Only if enabling Google sign-in                                       |
| `AUTH_GOOGLE_SECRET`           | optional | Only if enabling Google sign-in                                       |

## 2. Paystack — switch to live mode

1. Log into the Paystack dashboard, toggle to **Live mode**.
2. Copy the live secret + public keys into Vercel env vars (above).
3. Set the webhook URL to `https://mhirascollection.com/api/paystack/webhook`
   (Settings → API Keys & Webhooks).
4. Test with one real card transaction (low amount).

## 3. Database

- Run pending migrations on the production branch:
  `npx prisma migrate deploy`
- Seed real categories + at least one product if the prod DB is empty:
  `npx tsx --env-file=.env prisma/seed.ts`
- Import the product catalog if not already loaded:
  `npx tsx --env-file=.env prisma/import-products.ts`
- Promote Mhiras's user account to admin (one-time, run in `psql` or
  Prisma Studio): set `role = 'ADMIN'` on her User row. The signup form
  creates `CUSTOMER` accounts by default — there is no admin signup flow.

## 4. Email (Resend)

1. Add the production domain to Resend (Domains → Add Domain).
2. Add the DNS records Resend gives you to the registrar (TXT + DKIM).
   Wait for Resend to verify.
3. Once verified, set `EMAIL_FROM` to an address on that domain
   (e.g. `orders@mhirascollection.com`). The dev placeholder
   `onboarding@resend.dev` only delivers to the Resend account owner — do
   not ship with it.
4. Send one test order to confirm the confirmation email lands.

## 5. Rate limiting (Upstash Redis)

1. Sign up at https://upstash.com (free tier).
2. Create a **Global** Redis database (any region near Lagos is fine).
3. Copy **REST URL** + **REST Token** into the env vars above.
4. The limiters in `src/lib/rate-limit.ts` are no-ops without these. The
   build won't fail, but launching without them means signin and checkout
   are not protected against brute force / runaway scripts.

Current limits (tune in `src/lib/rate-limit.ts` if needed):
- Auth (signin + signup): 5 per IP per 15 min
- Checkout (`placeOrder`, paystack init): 10 per user per hour
- Image upload: 60 per admin per hour
- Stockpile delivery request: 30 per user per hour

## 6. Security patches

Run `npm audit` — at last check there were Next.js DoS / cache-poisoning
advisories fixed in 16.2.6+. Bump and retest:

```
npm install next@latest
npm run build  # confirm no breaking changes
```

## 7. Last-mile smoke test (on the real domain)

- [ ] Sign up a fresh customer account, sign out, sign back in
- [ ] Browse `/shop`, add an item to cart, complete a paid order (live card)
- [ ] Confirm the order email arrives
- [ ] Stockpile a second item, request delivery from `/account/stockpile`,
      pay the fee
- [ ] Mhiras logs into `/admin`, sees the order, updates status to
      Processing → Shipped → Delivered. Confirm each email fires.
- [ ] Verify the Paystack live transaction shows up in the Paystack dashboard
- [ ] Lighthouse from PageSpeed Insights against the live URL —
      target ≥ 90 on Performance + Accessibility

## 8. Things we deferred (post-launch)

These were called out during build and are not blockers, but worth tackling
soon after going live:

- Newsletter "Notify Me" button (footer + homepage) is non-functional —
  decide on a mailing-list provider and wire it up
- Cart "Apply promo code" button doesn't run validation client-side (it
  works at checkout, where validation is real)
- Social sign-in buttons on `/auth/signin` (Google, Phone OTP) are mock
  controls
- `/auth/forgot-password` form has no handler — wire up a Resend-based
  reset flow before any customer asks
- `/account/addresses`, `/account/payments`, `/account/notifications` menu
  items lead nowhere
- Lighthouse + bundle audit (now that the site is live)
