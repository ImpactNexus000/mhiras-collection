import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone, Mail, Copy } from "lucide-react";

const order = {
  id: "MH-0847",
  status: "processing",
  date: "Apr 9, 2026 2:14 PM",
  customer: {
    name: "Amara Okonkwo",
    email: "amara@email.com",
    phone: "+234 801 234 5678",
    address: "12 Admiralty Way, Lekki Phase 1, Lagos",
  },
  items: [
    { name: "Vintage Denim Jacket", size: "M", condition: "Like New", qty: 1, price: 12000 },
    { name: "Silk Midi Skirt", size: "S", condition: "Good", qty: 1, price: 12000 },
  ],
  subtotal: 24000,
  delivery: 1500,
  total: 25500,
  payment: { method: "Paystack", ref: "PAY-3948573920", status: "paid" },
};

const timeline = [
  { label: "Order placed", time: "Apr 9, 2:14 PM", done: true },
  { label: "Payment confirmed", time: "Apr 9, 2:15 PM", done: true },
  { label: "Processing", time: "Apr 9, 3:00 PM", done: true, active: true },
  { label: "Shipped", time: "—", done: false },
  { label: "Delivered", time: "—", done: false },
];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      {/* Back + header */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-charcoal transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        All Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-light italic">
            #{order.id}
          </h1>
          <span className="pill pill-processing">{order.status}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Print
          </Button>
          <Button size="sm" variant="outline">
            Send to WhatsApp
          </Button>
          <Button size="sm">Update Status</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Items */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-medium">
                Items ({order.items.length})
              </h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark">
                  <th className="text-left px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Product
                  </th>
                  <th className="text-left px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Size
                  </th>
                  <th className="text-left px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Condition
                  </th>
                  <th className="text-center px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Qty
                  </th>
                  <th className="text-right px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.name} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{item.name}</td>
                    <td className="px-5 py-3 text-charcoal-soft">{item.size}</td>
                    <td className="px-5 py-3 text-charcoal-soft">{item.condition}</td>
                    <td className="px-5 py-3 text-center">{item.qty}</td>
                    <td className="px-5 py-3 text-right">
                      ₦{item.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-border bg-cream-dark space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-soft">Subtotal</span>
                <span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-soft">Delivery</span>
                <span>₦{order.delivery.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-1 border-t border-border">
                <span>Total</span>
                <span className="text-copper">
                  ₦{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">Payment</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-charcoal-soft uppercase tracking-wider mb-1">
                  Method
                </div>
                <div>{order.payment.method}</div>
              </div>
              <div>
                <div className="text-xs text-charcoal-soft uppercase tracking-wider mb-1">
                  Reference
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">{order.payment.ref}</span>
                  <Copy size={12} className="text-charcoal-soft cursor-pointer" />
                </div>
              </div>
              <div>
                <div className="text-xs text-charcoal-soft uppercase tracking-wider mb-1">
                  Status
                </div>
                <span className="pill pill-delivered">{order.payment.status}</span>
              </div>
            </div>
          </div>

          {/* Admin notes */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">Internal Notes</h3>
            <textarea
              rows={3}
              placeholder="Add a note about this order..."
              className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-copper resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="outline">
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Timeline */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-4">Order Timeline</h3>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                        step.active
                          ? "border-copper bg-copper"
                          : step.done
                          ? "border-copper bg-copper"
                          : "border-border bg-white"
                      }`}
                    />
                    {i < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          step.done ? "bg-copper" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="-mt-0.5 pb-4">
                    <div
                      className={`text-sm ${
                        step.active ? "font-medium text-copper" : step.done ? "text-charcoal" : "text-charcoal-soft"
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-charcoal-soft">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">Customer</h3>
            <div className="text-base font-medium mb-2">
              {order.customer.name}
            </div>
            <div className="space-y-2 text-sm text-charcoal-soft">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                {order.customer.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                {order.customer.phone}
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                {order.customer.address}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" fullWidth size="sm">
                Mark as Shipped
              </Button>
              <Button variant="outline" fullWidth size="sm">
                Send Tracking Link
              </Button>
              <button className="w-full text-sm text-danger hover:text-danger/80 py-2 cursor-pointer">
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
