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
| `BREVO_API_KEY`                | ✅       | From https://app.brevo.com/settings/keys/api                          |
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

## 4. Email (Brevo)

We use Brevo (free tier: 300 emails/day, multiple sender domains allowed).
Transactional sends go through `POST /v3/smtp/email` via `fetch` — no SDK.

1. Sign in at https://app.brevo.com and add the production domain
   (Senders, Domains & dedicated IPs → Domains → Add a domain).
2. Add the DNS records Brevo gives you to your registrar (DKIM + SPF +
   Brevo code). Wait for the domain to show as "Authenticated".
3. Set `EMAIL_FROM` to an address on that verified domain
   (e.g. `orders@mhirascollection.com`). Brevo rejects sends from
   unverified domains.
4. Set `BREVO_API_KEY` (Account → SMTP & API → Create new API key).
5. Sign up a fresh customer to confirm the 6-digit verification code email
   lands. Then place a test order to confirm the order/payment emails work.

What the app sends:
- 6-digit verification code on signup + on resend (`sendVerificationCode`)
- Welcome email after successful verification
- Order confirmation (immediate + stockpile flows)
- Payment confirmed
- Order status updates (Processing / Shipped / Delivered)
- Admin alert when a stockpile delivery request is created (sent to `ADMIN_EMAIL`)

## 4a. Email verification flow

New users must verify their email before they can sign in.

- Signup → 6-digit code (15-min expiry) sent via Brevo → user lands on
  `/auth/verify-email?email=…` → enter code → redirected to signin.
- Signin from an unverified account is blocked; the form auto-routes to
  `/auth/verify-email` so the user can finish.
- A "Resend code" button regenerates and resends the code. All verification
  endpoints are rate-limited (5 attempts per IP per 15 min via the auth
  limiter).
- Admin accounts are grandfathered by the migration
  (`emailVerified = NOW()` for any row with `role = 'ADMIN'`). Existing
  test customer accounts will need to re-verify or be wiped before launch.

## 4b. Admin two-factor signin

Admin accounts (any user with `role = 'ADMIN'`) get a second factor.
Customers are unaffected.

- Admin enters email + password on `/auth/signin`. After the password
  verifies, the server creates an `AdminOtp` row (10-min expiry), sends a
  6-digit code to the admin's email, and returns a `code: "admin_otp_required"`
  signal. The signin form auto-routes to `/auth/admin-verify?email=…`.
- Admin enters the code on `/auth/admin-verify`; the second Credentials
  provider (`admin-otp`) validates the open OTP, marks it consumed, and
  grants the session.
- Any prior unconsumed OTP for that admin is invalidated when a new one is
  issued — only one challenge is live at a time.
- No resend button on the verify page (would need to re-prove the password).
  If the code doesn't arrive, the admin signs in again to send a fresh one.
- Rate limit: 5 attempts per IP per 15 min on both the password step and
  the code submission step (via `authLimiter`).

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

Last applied 2026-05-30: `next` + `eslint-config-next` 16.2.2 → 16.2.6
(closed all the high/moderate Next.js advisories — DoS, cache-poisoning,
middleware bypass, CSP-nonce XSS, etc.) and `npm audit fix`
(brace-expansion, fast-uri).

Before launch, re-run:

```
npm audit
npm install next@latest && npm run build  # only if newer minor is out
```

**Residual advisories (accepted, dev-only):**
- `@hono/node-server` + `hono` chain via `prisma → @prisma/dev` (Prisma 7's
  studio/dev tooling; not in runtime). "Fix" downgrades Prisma 7 → 6.19.3
  — unacceptable.
- `postcss@8.4.31` pinned inside `next`; only used at build time. "Fix"
  downgrades Next 16 → 9 — unacceptable.

If a future Prisma / Next minor publishes with the chain advanced, re-run
`npm audit` and they'll clear automatically.

## 7. Last-mile smoke test (on the real domain)

- [ ] Sign up a fresh customer account, enter the 6-digit code from email,
      sign out, sign back in
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
