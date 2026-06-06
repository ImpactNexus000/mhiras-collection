"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { cn, formatPrice } from "@/lib/utils";
import { Minus, Plus, X, ShoppingBag, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  validatePromoCode,
  type ValidatePromoResult,
} from "@/app/actions/promo-codes";
import {
  clearAppliedPromo,
  readAppliedPromo,
  writeAppliedPromo,
  type AppliedPromo,
} from "@/lib/promo-storage";

const DELIVERY_FEE = 1500;

export function CartContent() {
  const { items, itemCount, subtotal, loading, removeItem, updateQuantity } = useCart();
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  const [promoCode, setPromoCode] = useState("");
  const [applied, setApplied] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Hydrate any promo already applied in this session (e.g. user clicked
  // back from checkout). Cart shows it pre-applied without re-validating
  // until they hit Apply again or proceed to checkout.
  useEffect(() => {
    const existing = readAppliedPromo();
    if (existing) setApplied(existing);
  }, []);

  // If the cart empties, a stored promo is meaningless — drop it.
  useEffect(() => {
    if (items.length === 0 && applied) {
      clearAppliedPromo();
      setApplied(null);
    }
  }, [items.length, applied]);

  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code || promoLoading) return;
    setPromoError("");
    setPromoLoading(true);
    const result: ValidatePromoResult = await validatePromoCode(code);
    setPromoLoading(false);
    if (!result.valid) {
      setPromoError(result.error);
      return;
    }
    const next: AppliedPromo = {
      code: result.code,
      discount: result.discount,
      freeDelivery: result.freeDelivery,
      message: result.message,
    };
    writeAppliedPromo(next);
    setApplied(next);
    setPromoCode("");
  }

  function handleRemovePromo() {
    clearAppliedPromo();
    setApplied(null);
    setPromoError("");
  }

  const discount = applied?.discount ?? 0;
  const freeDelivery = applied?.freeDelivery ?? false;
  const effectiveDelivery = freeDelivery ? 0 : DELIVERY_FEE;
  const total = subtotal + effectiveDelivery - discount;
  const checkoutHref = isAuthed
    ? "/checkout"
    : "/auth/signin?from=/checkout";

  // Block checkout while any line is sold out (maxStock 0) or asks for more
  // than is in stock — the order would be rejected server-side anyway.
  const hasUnavailable = items.some(
    (i) => i.maxStock === 0 || i.quantity > i.maxStock
  );

  if (loading) {
    return (
      <div className="text-center py-20 px-4">
        <Loader2 size={32} className="mx-auto text-copper animate-spin mb-4" />
        <p className="text-sm text-charcoal-soft">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <ShoppingBag size={48} className="mx-auto text-charcoal-soft/40 mb-4" />
        <h1 className="font-display text-3xl italic text-charcoal-soft mb-2">
          Your cart is empty
        </h1>
        <p className="text-sm text-charcoal-soft mb-6">
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link href="/shop">
          <Button>Continue Shopping →</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header nav */}
      <div className="bg-charcoal">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between text-sm">
          <span className="text-charcoal-soft">
            Your Cart ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </span>
          <Link href="/shop" className="text-charcoal-soft hover:text-cream transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_320px]">
        {/* Cart items */}
        <div className="p-5 md:p-6 md:border-r border-border">
          {items.map((item) => {
            const soldOut = item.maxStock === 0;
            const overStock =
              item.maxStock > 0 && item.quantity > item.maxStock;
            return (
            <div
              key={item.cartItemId}
              className={cn(
                "grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] gap-3 md:gap-4 py-5 border-b border-border last:border-b-0",
                soldOut && "opacity-60"
              )}
            >
              {/* Thumbnail */}
              <Link
                href={`/shop/${item.slug}`}
                aria-label={item.name}
                className="relative block w-16 md:w-20 h-20 md:h-24"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 80px, 64px"
                    className="object-cover rounded"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="w-full h-full bg-gradient-to-br from-cream-dark to-gold/30 rounded"
                  />
                )}
              </Link>

              {/* Details */}
              <div>
                <Link href={`/shop/${item.slug}`}>
                  <div className="text-base font-medium hover:text-copper transition-colors">
                    {item.name}
                  </div>
                </Link>
                <div className="text-sm text-charcoal-soft mt-1">
                  {item.size && `Size: ${item.size} · `}
                  {item.condition && `Condition: ${item.condition}`}
                </div>
                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="w-9 h-9 border border-border flex items-center justify-center cursor-pointer hover:bg-cream-dark transition-colors"
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span
                    aria-live="polite"
                    aria-label={`Quantity: ${item.quantity}`}
                    className="text-base font-medium w-5 text-center"
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="w-9 h-9 border border-border flex items-center justify-center cursor-pointer hover:bg-cream-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                  {!soldOut && !overStock && item.maxStock <= 2 && (
                    <span className="text-xs text-copper-dark ml-1">
                      ({item.maxStock} left)
                    </span>
                  )}
                </div>
                {soldOut && (
                  <p
                    role="alert"
                    className="mt-2 text-xs font-medium text-danger"
                  >
                    Sold out — remove to continue.
                  </p>
                )}
                {overStock && (
                  <p
                    role="alert"
                    className="mt-2 text-xs font-medium text-copper-dark"
                  >
                    Only {item.maxStock} left — reduce quantity to continue.
                  </p>
                )}
              </div>

              {/* Price + Remove */}
              <div className="text-right">
                <div className="text-lg font-medium text-copper">
                  {formatPrice(item.price * item.quantity)}
                </div>
                {item.originalPrice && (
                  <div className="text-xs text-charcoal-soft line-through mt-0.5">
                    {formatPrice(item.originalPrice)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.cartItemId)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="text-xs text-charcoal-soft hover:text-danger mt-3 cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <X size={12} aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="p-5 md:p-6 bg-cream-dark">
          <h2 className="font-display text-2xl font-light italic mb-4">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span>Subtotal ({itemCount} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span>Delivery (est.)</span>
              {freeDelivery ? (
                <span>
                  <span className="line-through text-charcoal-soft mr-2">
                    {formatPrice(DELIVERY_FEE)}
                  </span>
                  <span className="text-success">Free</span>
                </span>
              ) : (
                <span>{formatPrice(DELIVERY_FEE)}</span>
              )}
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-2 border-b border-border text-success">
                <span>Promo discount</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 text-lg font-medium">
              <span>Total</span>
              <span className="text-copper">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="mt-4">
            {applied ? (
              <div className="flex items-center justify-between bg-success/10 border border-success/30 px-3 py-2 rounded">
                <div className="flex items-center gap-2 text-sm">
                  <Tag size={14} aria-hidden="true" className="text-success" />
                  <div>
                    <div className="font-medium text-success">{applied.code}</div>
                    <div className="text-xs text-charcoal-soft">
                      {applied.message}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  aria-label={`Remove promo code ${applied.code}`}
                  className="text-charcoal-soft hover:text-danger cursor-pointer"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ) : isAuthed ? (
              <>
                <div className="flex">
                  <label htmlFor="cart-promo" className="sr-only">
                    Promo code
                  </label>
                  <input
                    id="cart-promo"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyPromo();
                      }
                    }}
                    placeholder="Enter promo code"
                    autoComplete="off"
                    className="flex-1 border border-border px-3 py-2.5 text-sm bg-white outline-none focus:border-copper uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || promoLoading}
                    className="bg-charcoal text-cream px-5 py-2.5 text-xs uppercase tracking-wider font-medium cursor-pointer hover:bg-copper transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {promoLoading ? (
                      <Loader2 size={12} aria-hidden="true" className="animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {promoError && (
                  <p role="alert" className="text-xs text-danger mt-2">
                    {promoError}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-charcoal-soft leading-snug">
                <Link
                  href="/auth/signin?from=/cart"
                  className="text-copper hover:text-copper-dark font-medium"
                >
                  Sign in
                </Link>{" "}
                to apply a promo code.
              </p>
            )}
          </div>

          {hasUnavailable ? (
            <div className="mt-5">
              <Button variant="primary" fullWidth size="lg" disabled>
                Update cart to checkout
              </Button>
              <p role="alert" className="text-center text-xs text-danger mt-2">
                Some items are sold out or low on stock. Remove or reduce them to
                continue.
              </p>
            </div>
          ) : (
            <Link href={checkoutHref} className="block mt-5">
              <Button variant="primary" fullWidth size="lg">
                {status === "authenticated"
                  ? "Checkout →"
                  : "Sign in to checkout →"}
              </Button>
            </Link>
          )}

          <p className="text-center text-xs text-charcoal-soft mt-4">
            🔒 Paystack · Flutterwave · Bank Transfer
          </p>
        </div>
      </div>
    </>
  );
}
