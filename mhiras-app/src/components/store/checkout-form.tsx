"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard, Building2, Truck } from "lucide-react";
import { placeOrder } from "@/app/actions/orders";

const DELIVERY_FEE = 1500;

type PaymentMethod = "card" | "bank_transfer" | "pay_on_delivery";

const states = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Kaduna",
  "Enugu",
  "Delta",
  "Edo",
];

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  state?: string;
}

export function CheckoutForm() {
  const { items, itemCount, subtotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const total = subtotal + DELIVERY_FEE;

  const paymentMethods: {
    value: PaymentMethod;
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: "card", label: "Card Payment", icon: CreditCard },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
    { value: "pay_on_delivery", label: "Pay on Delivery", icon: Truck },
  ];

  function validate(formData: FormData): FieldErrors {
    const errs: FieldErrors = {};

    if (!(formData.get("firstName") as string)?.trim())
      errs.firstName = "First name is required";
    if (!(formData.get("lastName") as string)?.trim())
      errs.lastName = "Last name is required";
    if (!(formData.get("phone") as string)?.trim())
      errs.phone = "Phone number is required";
    if (!(formData.get("email") as string)?.trim())
      errs.email = "Email is required";
    if (!(formData.get("address") as string)?.trim())
      errs.address = "Delivery address is required";
    if (!(formData.get("state") as string)?.trim())
      errs.state = "Please select a state";

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const formData = new FormData(e.currentTarget);
    const fieldErrors = validate(formData);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Attach payment method and cart items to the form data
    formData.set("paymentMethod", paymentMethod);
    formData.set(
      "items",
      JSON.stringify(
        items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        }))
      )
    );

    try {
      const result = await placeOrder(formData);
      if (result?.error) {
        setServerError(result.error);
        setLoading(false);
      }
      // If successful, placeOrder redirects — no need to handle here
    } catch {
      // redirect() throws a NEXT_REDIRECT error — that's expected
      // Only show error for actual failures
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="font-display text-3xl italic text-charcoal-soft mb-2">
          Nothing to checkout
        </h1>
        <p className="text-sm text-charcoal-soft mb-6">
          Add items to your cart first.
        </p>
        <Link href="/shop">
          <Button>Go to Shop →</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Checkout header */}
      <div className="bg-charcoal px-6 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-light tracking-widest uppercase text-cream"
        >
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

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid md:grid-cols-[1fr_340px]">
          {/* Form */}
          <div className="p-5 md:p-6">
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
                {serverError}
              </div>
            )}

            {/* Delivery */}
            <div className="text-xs uppercase tracking-widest text-copper font-medium mb-4">
              Step 1 of 2 — Delivery Details
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  First Name
                </label>
                <input className="input-base" name="firstName" />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  Last Name
                </label>
                <input className="input-base" name="lastName" />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  Phone Number
                </label>
                <input className="input-base" name="phone" type="tel" />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  Email
                </label>
                <input className="input-base" name="email" type="email" />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Delivery Address
              </label>
              <input className="input-base" name="address" />
              {errors.address && (
                <p className="text-xs text-red-600 mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  State
                </label>
                <select className="input-base" name="state">
                  <option value="">Select state</option>
                  {states.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-600 mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                  LGA
                </label>
                <input className="input-base" name="lga" />
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
                  type="button"
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

            {paymentMethod === "card" && (
              <div className="bg-cream-dark p-4 border border-border">
                <p className="text-sm text-charcoal-soft leading-relaxed">
                  You&apos;ll be redirected to Paystack to securely complete
                  your card payment after placing the order.
                </p>
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="bg-cream-dark p-4 border border-border">
                <p className="text-sm text-charcoal-soft leading-relaxed">
                  After placing your order, you&apos;ll receive bank account
                  details to complete the transfer. Your order will be confirmed
                  once payment is verified.
                </p>
                <div className="mt-3 p-3 bg-white border border-border text-sm">
                  <strong>GTBank</strong> · 0123456789 · Mhiras Collection
                </div>
              </div>
            )}

            {paymentMethod === "pay_on_delivery" && (
              <div className="bg-cream-dark p-4 border border-border">
                <p className="text-sm text-charcoal-soft leading-relaxed">
                  Pay with cash or card when your order is delivered. Available
                  for Lagos deliveries only.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 text-xs text-charcoal-soft">
              <Lock size={13} />
              Your payment is secured by Paystack. We never store your card
              details.
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="p-5 md:p-6 bg-cream-dark">
            <h2 className="font-display text-2xl font-light italic mb-4">
              Your Order
            </h2>

            <div className="mb-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 items-center pb-3 border-b border-border last:border-b-0"
                >
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
                <span>Subtotal ({itemCount} items)</span>
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

            <Button
              variant="primary"
              fullWidth
              size="lg"
              type="submit"
              className="mt-4"
              disabled={loading}
            >
              {loading ? "Placing Order..." : `Pay ${formatPrice(total)} →`}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
