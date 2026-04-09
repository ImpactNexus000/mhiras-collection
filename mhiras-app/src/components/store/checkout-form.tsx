"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard, Building2, Truck } from "lucide-react";

const DELIVERY_FEE = 1500;

type PaymentMethod = "card" | "bank_transfer" | "pay_on_delivery";

const states = ["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Ogun", "Kaduna", "Enugu", "Delta", "Edo"];

export function CheckoutForm() {
  const { items, itemCount, subtotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const total = subtotal + DELIVERY_FEE;

  const paymentMethods: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
    { value: "card", label: "Card Payment", icon: CreditCard },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
    { value: "pay_on_delivery", label: "Pay on Delivery", icon: Truck },
  ];

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="font-display text-3xl italic text-charcoal-soft mb-2">
          Nothing to checkout
        </h1>
        <p className="text-sm text-charcoal-soft mb-6">Add items to your cart first.</p>
        <Link href="/shop"><Button>Go to Shop →</Button></Link>
      </div>
    );
  }

  return (
    <>
      {/* Checkout header */}
      <div className="bg-charcoal px-6 h-12 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-light tracking-widest uppercase text-cream">
          Mhiras Collection
        </Link>
        <div className="flex items-center gap-2 text-sm text-charcoal-soft">
          <span className="text-cream">Delivery</span>
          <span>›</span>
          <span>Payment</span>
          <span>›</span>
          <span>Confirm</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-charcoal-soft">
          <Lock size={13} /> Secure Checkout
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_340px]">
        {/* Form */}
        <div className="p-5 md:p-6">
          {/* Delivery */}
          <div className="text-xs uppercase tracking-widest text-copper font-medium mb-4">
            Step 1 of 2 — Delivery Details
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">First Name</label>
              <input className="input-base" defaultValue="Amara" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">Last Name</label>
              <input className="input-base" defaultValue="Okonkwo" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">Phone Number</label>
              <input className="input-base" defaultValue="+234 801 234 5678" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">Email</label>
              <input className="input-base" defaultValue="amara@email.com" />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">Delivery Address</label>
            <input className="input-base" defaultValue="14 Adeniyi Jones Ave, Ikeja, Lagos" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">State</label>
              <select className="input-base">
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">LGA</label>
              <input className="input-base" defaultValue="Ikeja" />
            </div>
          </div>

          <div className="h-px bg-border my-6" />

          {/* Payment method */}
          <div className="text-xs uppercase tracking-widest text-copper font-medium mb-4">
            Payment Method
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {paymentMethods.map((pm) => (
              <button
                key={pm.value}
                onClick={() => setPaymentMethod(pm.value)}
                className={`flex items-center gap-2 px-4 py-2.5 border text-sm cursor-pointer transition-colors ${
                  paymentMethod === pm.value
                    ? "border-copper bg-copper-light text-copper-dark"
                    : "border-border bg-white text-charcoal-mid hover:border-charcoal-soft"
                }`}
              >
                <pm.icon size={16} />
                {pm.label}
              </button>
            ))}
          </div>

          {/* Card details */}
          {paymentMethod === "card" && (
            <div className="bg-cream-dark p-4 border border-border">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-2 block">
                Card Details
              </label>
              <input className="input-base mb-2" placeholder="1234 5678 9012 3456" />
              <div className="grid grid-cols-2 gap-2">
                <input className="input-base" placeholder="MM / YY" />
                <input className="input-base" placeholder="CVV" />
              </div>
            </div>
          )}

          {paymentMethod === "bank_transfer" && (
            <div className="bg-cream-dark p-4 border border-border">
              <p className="text-sm text-charcoal-soft leading-relaxed">
                After placing your order, you&apos;ll receive bank account details to complete
                the transfer. Your order will be confirmed once payment is verified.
              </p>
              <div className="mt-3 p-3 bg-white border border-border text-sm">
                <strong>GTBank</strong> · 0123456789 · Mhiras Collection
              </div>
            </div>
          )}

          {paymentMethod === "pay_on_delivery" && (
            <div className="bg-cream-dark p-4 border border-border">
              <p className="text-sm text-charcoal-soft leading-relaxed">
                Pay with cash or card when your order is delivered.
                Available for Lagos deliveries only.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 text-xs text-charcoal-soft">
            <Lock size={13} />
            Your payment is secured by Paystack. We never store your card details.
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="p-5 md:p-6 bg-cream-dark">
          <h2 className="font-display text-2xl font-light italic mb-4">
            Your Order
          </h2>

          {/* Mini item list */}
          <div className="mb-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 items-center pb-3 border-b border-border last:border-b-0">
                <div className="w-12 h-16 bg-cream-dark border border-border flex-shrink-0 rounded" />
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-charcoal-soft">
                    {item.size && `Size ${item.size} · `}
                    {formatPrice(item.price)}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span>Delivery</span>
              <span>{formatPrice(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-medium">
              <span>Total</span>
              <span className="text-copper">{formatPrice(total)}</span>
            </div>
          </div>

          <Button variant="primary" fullWidth size="lg" className="mt-4">
            Pay {formatPrice(total)} →
          </Button>
        </div>
      </div>
    </>
  );
}
