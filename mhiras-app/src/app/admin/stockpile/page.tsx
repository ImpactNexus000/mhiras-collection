import { formatPrice, formatDate } from "@/lib/utils";
import {
  getAdminDeliveryRequests,
  getAdminStockpiledItems,
} from "@/lib/queries/stockpile";
import { DeliveryRequestActions } from "@/components/admin/delivery-request-actions";

const drStatusPill: Record<string, string> = {
  PENDING_PAYMENT: "pill pill-pending",
  PAID: "pill pill-confirmed",
  PROCESSING: "pill pill-processing",
  SHIPPED: "pill pill-shipped",
  DELIVERED: "pill pill-delivered",
  CANCELLED: "pill pill-cancelled",
};

const drStatusLabel: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AdminStockpilePage() {
  const [deliveryRequests, stockpiledItems] = await Promise.all([
    getAdminDeliveryRequests(),
    getAdminStockpiledItems(),
  ]);

  // Group held items by customer
  const groups = new Map<
    string,
    {
      name: string;
      email: string;
      items: typeof stockpiledItems;
    }
  >();
  for (const item of stockpiledItems) {
    const u = item.order.user;
    if (!groups.has(u.id)) {
      groups.set(u.id, {
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        items: [],
      });
    }
    groups.get(u.id)!.items.push(item);
  }
  const customerStockpiles = [...groups.values()];

  const openRequests = deliveryRequests.filter(
    (dr) => dr.status !== "DELIVERED" && dr.status !== "CANCELLED"
  ).length;

  const stats = [
    { label: "Open Delivery Requests", value: openRequests },
    { label: "Items in Stockpiles", value: stockpiledItems.length },
    { label: "Customers Stockpiling", value: customerStockpiles.length },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Stockpile
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-border rounded-lg p-4"
          >
            <div className="text-2xl font-medium">{s.value}</div>
            <div className="text-xs text-charcoal-soft uppercase tracking-wider mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery requests queue */}
      <h2 className="text-sm font-medium uppercase tracking-wider text-charcoal-soft mb-3">
        Delivery Requests
      </h2>
      {deliveryRequests.length > 0 ? (
        <div className="bg-white border border-border rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark">
                  {[
                    "Request",
                    "Customer",
                    "Items",
                    "Delivery Fee",
                    "Payment",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-soft font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deliveryRequests.map((dr) => (
                  <tr key={dr.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      #{dr.requestNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {dr.user.firstName} {dr.user.lastName}
                      </div>
                      <div className="text-xs text-charcoal-soft">
                        {dr.address.state}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <div>{dr.items.length} item{dr.items.length === 1 ? "" : "s"}</div>
                      <div className="text-xs text-charcoal-soft truncate">
                        {dr.items.map((i) => i.product.name).join(", ")}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(dr.deliveryFee)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft text-xs">
                      {dr.paymentStatus}
                    </td>
                    <td className="px-4 py-3">
                      <span className={drStatusPill[dr.status] ?? "pill"}>
                        {drStatusLabel[dr.status] ?? dr.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft text-xs whitespace-nowrap">
                      {formatDate(dr.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <DeliveryRequestActions
                        deliveryRequestId={dr.id}
                        status={dr.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg p-10 text-center text-charcoal-soft mb-8">
          No delivery requests yet.
        </div>
      )}

      {/* Customer stockpiles */}
      <h2 className="text-sm font-medium uppercase tracking-wider text-charcoal-soft mb-3">
        Customer Stockpiles
      </h2>
      {customerStockpiles.length > 0 ? (
        <div className="space-y-3">
          {customerStockpiles.map((group) => {
            const value = group.items.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            );
            const expiries = group.items
              .map((i) => i.order.stockpileExpiresAt)
              .filter((d): d is Date => d != null)
              .sort((a, b) => a.getTime() - b.getTime());
            return (
              <div
                key={group.email}
                className="bg-white border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-medium">{group.name}</div>
                    <div className="text-xs text-charcoal-soft">
                      {group.email}
                    </div>
                  </div>
                  <div className="text-right text-xs text-charcoal-soft">
                    <div className="text-sm font-medium text-charcoal">
                      {group.items.length} item
                      {group.items.length === 1 ? "" : "s"} ·{" "}
                      {formatPrice(value)}
                    </div>
                    {expiries[0] && (
                      <div>Earliest request-by {formatDate(expiries[0])}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-charcoal-soft mt-2 border-t border-border pt-2">
                  {group.items
                    .map(
                      (i) =>
                        `${i.product.name}${i.size ? ` (${i.size})` : ""}`
                    )
                    .join(" · ")}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg p-10 text-center text-charcoal-soft">
          No items are currently being stockpiled.
        </div>
      )}
    </>
  );
}
