"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const DELIVERY_FEE = 1500;

export function CartContent() {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount] = useState(0);

  const total = subtotal + DELIVERY_FEE - discount;

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
      <div className="bg-charcoal px-6 h-12 flex items-center justify-between text-sm">
        <span className="text-charcoal-soft">
          Your Cart ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
        <Link href="/shop" className="text-charcoal-soft hover:text-cream transition-colors">
          Continue Shopping
        </Link>
      </div>

      <div className="grid md:grid-cols-[1fr_340px]">
        {/* Cart items */}
        <div className="p-5 md:p-6 border-r border-border">
          {items.map((item) => (
            <div
              key={item.productId}
              className="grid grid-cols-[80px_1fr_auto] gap-4 py-5 border-b border-border last:border-b-0"
            >
              {/* Thumbnail */}
              <Link href={`/shop/${item.slug}`}>
                <div className="w-20 h-24 bg-gradient-to-br from-cream-dark to-gold/30 rounded" />
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
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 border border-border flex items-center justify-center cursor-pointer hover:bg-cream-dark transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-base font-medium w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="w-8 h-8 border border-border flex items-center justify-center cursor-pointer hover:bg-cream-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                  {item.maxStock <= 2 && (
                    <span className="text-xs text-copper-dark ml-1">
                      ({item.maxStock} left)
                    </span>
                  )}
                </div>
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
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-charcoal-soft hover:text-danger mt-3 cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
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
              <span>Delivery — Lagos</span>
              <span>{formatPrice(DELIVERY_FEE)}</span>
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
          <div className="flex mt-4">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 border border-border px-3 py-2.5 text-sm bg-white outline-none focus:border-copper"
            />
            <button className="bg-charcoal text-cream px-5 py-2.5 text-xs uppercase tracking-wider font-medium cursor-pointer hover:bg-copper transition-colors">
              Apply
            </button>
          </div>

          <Link href="/checkout" className="block mt-5">
            <Button variant="primary" fullWidth size="lg">
              Checkout →
            </Button>
          </Link>

          <p className="text-center text-xs text-charcoal-soft mt-4">
            🔒 Paystack · Flutterwave · Bank Transfer
          </p>
        </div>
      </div>
    </>
  );
}
