-- CreateTable
CREATE TABLE "saved_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorizationCode" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expMonth" TEXT NOT NULL,
    "expYear" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "bank" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_cards_authorizationCode_key" ON "saved_cards"("authorizationCode");

-- CreateIndex
CREATE INDEX "saved_cards_userId_idx" ON "saved_cards"("userId");

-- AddForeignKey
ALTER TABLE "saved_cards" ADD CONSTRAINT "saved_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
