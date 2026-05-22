"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Lock,
  CreditCard,
  Building2,
  Truck,
  Package,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { placeOrder } from "@/app/actions/orders";
import {
  validatePromoCode,
  type ValidatePromoResult,
} from "@/app/actions/promo-codes";
import { matchZoneForState, type DeliveryZoneLike } from "@/lib/delivery";

type PaymentMethod = "card" | "bank_transfer";
type Fulfillment = "immediate" | "stockpile";

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

interface CheckoutFormProps {
  deliveryZones: DeliveryZoneLike[];
  stockpileExpiryDays: number;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  state?: string;
}

export function CheckoutForm({
  deliveryZones,
  stockpileExpiryDays,
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, itemCount, subtotal, refreshCart } = useCart();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("immediate");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedState, setSelectedState] = useState("");

  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<ValidatePromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const isStockpile = fulfillment === "stockpile";

  const deliveryMatch = matchZoneForState(selectedState, deliveryZones);
  const baseDeliveryFee = deliveryMatch?.fee ?? 0;

  const appliedPromo = promoResult?.valid ? promoResult : null;
  const discount = appliedPromo?.discount ?? 0;
  // Stockpile orders are not charged delivery at checkout.
  const effectiveDeliveryFee = isStockpile
    ? 0
    : appliedPromo?.freeDelivery
      ? 0
      : baseDeliveryFee;
  const total = subtotal + effectiveDeliveryFee - discount;

  const paymentMethods: {
    value: PaymentMethod;
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: "card", label: "Card Payment", icon: CreditCard },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  ];

  // Stockpile orders must be prepaid online by card.
  const visibleMethods = isStockpile
    ? paymentMethods.filter((pm) => pm.value === "card")
    : paymentMethods;

  function selectFulfillment(next: Fulfillment) {
    setFulfillment(next);
    setErrors({});
    setServerError("");
    if (next === "stockpile") setPaymentMethod("card");
  }

  function validate(formData: FormData): FieldErrors {
    // Stockpile orders collect no delivery details at checkout.
    if (isStockpile) return {};

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

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code || promoLoading) return;
    setPromoLoading(true);
    const result = await validatePromoCode(code);
    setPromoResult(result);
    setPromoLoading(false);
  }

  function handleRemovePromo() {
    setPromoInput("");
    setPromoResult(null);
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

    // Attach fulfillment, payment method and cart items to the form data
    formData.set("fulfillmentType", fulfillment);
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

    if (appliedPromo) {
      formData.set("promoCode", appliedPromo.code);
    }

    try {
      const result = await placeOrder(formData);

      if (result?.error) {
        setServerError(result.error);
        setLoading(false);
        return;
      }

      // Order placed — cart is cleared server-side. Show the redirect screen
      // so the customer never sees an "empty cart" flash while we hand off.
      setRedirecting(true);

      // Refresh cart context (cart was cleared server-side)
      await refreshCart();

      // For card payments, redirect to Paystack
      if (result.paymentMethod === "card" && result.orderId) {
        const paystackRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: result.orderId }),
        });

        const paystackData = await paystackRes.json();

        if (paystackData.authorization_url) {
          window.location.href = paystackData.authorization_url;
          return;
        }

        // If Paystack init fails, still redirect to order page
        setServerError(
          paystackData.error ||
            "Payment initialization failed. You can retry from your order page."
        );
        setLoading(false);
        // Redirect to order page after a short delay so user sees the error
        setTimeout(() => {
          router.push(`/order/${result.orderNumber}`);
        }, 3000);
        return;
      }

      // For bank transfer and pay on delivery, go straight to order page
      router.push(`/order/${result.orderNumber}`);
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // Handing off to Paystack — shown instead of the cart so there's no
  // confusing "empty cart" flash after the order is placed.
  if (redirecting) {
    return (
      <div className="text-center py-24 px-4">
        <Loader2 size={36} className="mx-auto text-copper animate-spin mb-5" />
        <h1 className="font-display text-3xl italic mb-2">
          Taking you to secure payment
        </h1>
        <p className="text-sm text-charcoal-soft max-w-md mx-auto leading-relaxed">
          Please stay on this page — we&apos;re redirecting you to Paystack to
          complete your payment. Don&apos;t close or refresh this window.
        </p>
      </div>
    );
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
          <span className="text-cream">
            {isStockpile ? "Stockpile" : "Delivery"}
          </span>
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

            {/* Fulfillment choice */}
            <div className="text-xs uppercase tracking-widest text-copper font-medium mb-3">
              How would you like this order?
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {(
                [
                  {
                    value: "immediate" as const,
                    icon: Truck,
                    title: "Deliver Now",
                    desc: "Ship this order to your address",
                  },
                  {
                    value: "stockpile" as const,
                    icon: Package,
                    title: "Add to Stockpile",
                    desc: "Pay now, request delivery later",
                  },
                ]
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectFulfillment(opt.value)}
                  className={`flex items-start gap-2.5 p-3 border text-left cursor-pointer transition-colors ${
                    fulfillment === opt.value
                      ? "border-copper bg-copper-light"
                      : "border-border bg-white hover:border-charcoal-soft"
                  }`}
                >
                  <opt.icon
                    size={18}
                    className={
                      fulfillment === opt.value
                        ? "text-copper mt-0.5"
                        : "text-charcoal-soft mt-0.5"
                    }
                  />
                  <span>
                    <span className="block text-sm font-medium text-charcoal">
                      {opt.title}
                    </span>
                    <span className="block text-xs text-charcoal-soft mt-0.5">
                      {opt.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {isStockpile ? (
              /* Stockpile explainer — no delivery details collected here */
              <div className="bg-cream-dark border border-border p-4 mb-6 text-sm text-charcoal-soft leading-relaxed">
                <strong className="text-charcoal">
                  These items go into your stockpile.
                </strong>{" "}
                You&apos;re paying for them now, but they&apos;ll be held for
                you — no delivery address needed yet. Keep shopping and add
                more anytime. When you&apos;re ready, request delivery from
                your stockpile (under your account) and pay the delivery fee
                then. Items are held for{" "}
                <strong className="text-charcoal">
                  {stockpileExpiryDays} days
                </strong>
                .
              </div>
            ) : (
              <>
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
                      <p className="text-xs text-red-600 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                      Email
                    </label>
                    <input className="input-base" name="email" type="email" />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                    Delivery Address
                  </label>
                  <input className="input-base" name="address" />
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                      State
                    </label>
                    <select
                      className="input-base"
                      name="state"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">Select state</option>
                      {states.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                      LGA
                    </label>
                    <input className="input-base" name="lga" />
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-border my-6" />

            {/* Payment method */}
            <div className="text-xs uppercase tracking-widest text-copper font-medium mb-4">
              Payment Method
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {visibleMethods.map((pm) => (
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
                  {isStockpile
                    ? "Stockpile orders are prepaid online by card. You'll be redirected to Paystack to securely complete payment after placing the order."
                    : "You'll be redirected to Paystack to securely complete your card payment after placing the order."}
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

            {/* Promo code */}
            <div className="mb-4 pb-4 border-b border-border">
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/30 px-3 py-2 rounded">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag size={14} className="text-success" />
                    <div>
                      <div className="font-medium text-success">
                        {appliedPromo.code}
                      </div>
                      <div className="text-xs text-charcoal-soft">
                        {appliedPromo.message}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-charcoal-soft hover:text-danger cursor-pointer"
                    title="Remove promo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code"
                      className="input-base flex-1 uppercase"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!promoInput.trim() || promoLoading}
                      className="px-4 text-xs uppercase tracking-wider border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {promoLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                  {promoResult && !promoResult.valid && (
                    <p className="text-xs text-danger mt-2">
                      {promoResult.error}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-2 border-b border-border text-success">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              {isStockpile ? (
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Delivery</span>
                  <span className="text-charcoal-soft text-xs text-right">
                    Charged when you
                    <br />
                    request delivery
                  </span>
                </div>
              ) : (
                <div className="flex justify-between py-2 border-b border-border">
                  <div>
                    <span>Delivery</span>
                    {deliveryMatch && (
                      <div className="text-xs text-charcoal-soft">
                        {deliveryMatch.name} · {deliveryMatch.estimateDays}
                      </div>
                    )}
                  </div>
                  <span>
                    {!selectedState ? (
                      <span className="text-charcoal-soft text-xs">
                        Select state
                      </span>
                    ) : !deliveryMatch ? (
                      <span className="text-charcoal-soft text-xs">—</span>
                    ) : appliedPromo?.freeDelivery ? (
                      <>
                        <span className="line-through text-charcoal-soft mr-2">
                          {formatPrice(baseDeliveryFee)}
                        </span>
                        <span className="text-success">Free</span>
                      </>
                    ) : (
                      formatPrice(baseDeliveryFee)
                    )}
                  </span>
                </div>
              )}
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
              disabled={loading || (!isStockpile && !deliveryMatch)}
            >
              {loading
                ? "Placing Order..."
                : isStockpile
                  ? `Pay ${formatPrice(total)} & Stockpile →`
                  : !selectedState
                    ? "Select state to continue"
                    : !deliveryMatch
                      ? "We don't deliver here yet"
                      : `Pay ${formatPrice(total)} →`}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
