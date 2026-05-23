import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  getStockpileItems,
  getDeliveryRequests,
} from "@/lib/queries/stockpile";
import { getDeliveryZones } from "@/lib/queries/delivery";
import { verifyTransaction } from "@/lib/paystack";
import {
  StockpileManager,
  type StockpileItemView,
} from "@/components/store/stockpile-manager";
import { DeliveryPaymentButton } from "@/components/store/delivery-payment-button";
import { CheckCircle2, AlertTriangle, Truck } from "lucide-react";

export const metadata: Metadata = { title: "My Stockpile" };

interface PageProps {
  searchParams: Promise<{
    payment?: string;
    reference?: string;
    trxref?: string;
  }>;
}

// Verify a Paystack callback for a delivery-fee payment and mark the
// delivery request paid (webhooks don't reach localhost in development).
async function verifyDeliveryPayment(
  reference: string
): Promise<"success" | "failed" | "pending"> {
  try {
    const result = await verifyTransaction(reference);
    if (result.data.status === "success") {
      const dr = await db.deliveryRequest.findFirst({
        where: { paymentRef: reference },
      });
      if (dr && dr.paymentStatus !== "PAID") {
        await db.deliveryRequest.update({
          where: { id: dr.id },
          data: { paymentStatus: "PAID", status: "PAID" },
        });
      }
      return "success";
    }
    if (
      result.data.status === "failed" ||
      result.data.status === "abandoned"
    ) {
      return "failed";
    }
    return "pending";
  } catch {
    return "pending";
  }
}

const drStatusLabel: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting Payment",
  PAID: "Paid — Preparing",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const drStatusClass: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning/15 text-warning",
  PAID: "bg-copper-light text-copper-dark",
  PROCESSING: "bg-copper-light text-copper-dark",
  SHIPPED: "bg-copper-light text-copper-dark",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-danger/10 text-danger",
};

export default async function StockpilePage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?from=/account/stockpile");
  const userId = session.user.id;

  // Handle Paystack callback for a delivery-fee payment
  const query = await searchParams;
  let paymentResult: "success" | "failed" | "pending" | null = null;
  const reference = query.reference || query.trxref;
  if (query.payment === "callback" && reference) {
    paymentResult = await verifyDeliveryPayment(reference);
  }

  const [rawItems, deliveryRequests, zones] = await Promise.all([
    getStockpileItems(userId),
    getDeliveryRequests(userId),
    getDeliveryZones(),
  ]);

  // Server Component renders once per request — current time is correct here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const items: StockpileItemView[] = rawItems.map((item) => {
    const expiresAt = item.order.stockpileExpiresAt;
    return {
      id: item.id,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0]?.url ?? null,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
      orderNumber: item.order.orderNumber,
      expiresLabel: expiresAt ? formatDate(expiresAt) : null,
      expired: expiresAt ? new Date(expiresAt).getTime() < now : false,
    };
  });

  const deliveryZones = zones.map((z) => ({
    id: z.id,
    name: z.name,
    states: z.states,
    fee: z.fee,
    estimateDays: z.estimateDays,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/account"
          className="text-xs uppercase tracking-wider text-charcoal-soft hover:text-copper"
        >
          ← Account
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-light italic mt-2">
          My Stockpile
        </h1>
        <p className="text-sm text-charcoal-soft mt-1">
          Items you&apos;ve paid for and chosen to keep with us. Select what
          you want delivered, then pay the delivery fee.
        </p>
      </div>

      {/* Payment callback banner */}
      {paymentResult === "success" && (
        <div className="mb-6 flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded text-sm text-success">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            Delivery fee paid — your delivery request is confirmed and being
            prepared.
          </span>
        </div>
      )}
      {paymentResult === "failed" && (
        <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            That payment didn&apos;t go through. Your items are still in your
            stockpile — you can request delivery again below.
          </span>
        </div>
      )}

      {/* Stockpile items + request flow */}
      <StockpileManager items={items} deliveryZones={deliveryZones} />

      {/* Delivery requests */}
      {deliveryRequests.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-light italic mb-3">
            Delivery Requests
          </h2>
          <div className="space-y-3">
            {deliveryRequests.map((dr) => (
              <div
                key={dr.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-copper" />
                    <span className="text-sm font-medium">
                      #{dr.requestNumber}
                    </span>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded ${
                      drStatusClass[dr.status] ?? "bg-cream-dark"
                    }`}
                  >
                    {drStatusLabel[dr.status] ?? dr.status}
                  </span>
                </div>
                <div className="text-sm text-charcoal-soft">
                  {dr.items.length} item{dr.items.length === 1 ? "" : "s"} —{" "}
                  {dr.items.map((i) => i.product.name).join(", ")}
                </div>
                <div className="text-xs text-charcoal-soft mt-1">
                  Delivery fee {formatPrice(dr.deliveryFee)} · to{" "}
                  {dr.address.state} · requested {formatDate(dr.createdAt)}
                </div>
                {dr.status === "PENDING_PAYMENT" && (
                  <div className="mt-3">
                    <DeliveryPaymentButton deliveryRequestId={dr.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
