-- Case-insensitive unique guard on email.
--
-- Application code already normalizes every email to lowercase on write (see
-- normalizeEmail in src/lib/utils.ts), but the existing `users_email_key`
-- unique constraint is case-sensitive at the database level. This functional
-- index makes Postgres itself refuse two accounts that differ only by case,
-- so a future regression in the app layer can't silently create duplicates.
--
-- Safe to add: a prior check confirmed zero case-collisions in the table.
CREATE UNIQUE INDEX "users_email_lower_key" ON "users" (lower("email"));
