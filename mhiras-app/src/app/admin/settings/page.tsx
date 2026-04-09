import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const deliveryZones = [
  { zone: "Lagos Island", fee: "₦1,500", time: "1-2 days" },
  { zone: "Lagos Mainland", fee: "₦2,000", time: "1-2 days" },
  { zone: "Abuja", fee: "₦3,500", time: "2-4 days" },
  { zone: "South-West", fee: "₦3,000", time: "3-5 days" },
  { zone: "South-East / South-South", fee: "₦4,000", time: "3-5 days" },
  { zone: "North", fee: "₦5,000", time: "5-7 days" },
];

export default function AdminSettingsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Settings
        </h1>
        <Button size="sm">
          <Save size={14} className="mr-1.5" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-5 max-w-3xl">
        {/* Store Information */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-4">Store Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Store Name
              </label>
              <input
                className="input-base"
                defaultValue="Mhiras Collection"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Contact Email
              </label>
              <input
                className="input-base"
                type="email"
                defaultValue="hello@mhirascollection.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                WhatsApp Number
              </label>
              <input
                className="input-base"
                type="tel"
                defaultValue="+234 901 234 5678"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
                Instagram Handle
              </label>
              <input
                className="input-base"
                defaultValue="@mhiras_collection"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-4">Payment Gateways</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-sm">
                  PS
                </div>
                <div>
                  <div className="text-sm font-medium">Paystack</div>
                  <div className="text-xs text-charcoal-soft">
                    Primary gateway &middot; Cards, Bank Transfer, USSD
                  </div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 font-bold text-sm">
                  FW
                </div>
                <div>
                  <div className="text-sm font-medium">Flutterwave</div>
                  <div className="text-xs text-charcoal-soft">
                    Backup gateway &middot; Cards, Mobile Money
                  </div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">
                  BT
                </div>
                <div>
                  <div className="text-sm font-medium">
                    Manual Bank Transfer
                  </div>
                  <div className="text-xs text-charcoal-soft">
                    GTBank 0123456789 — Mhiras Collection
                  </div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="bg-white border border-border rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Delivery Zones</h3>
            <button className="text-xs text-copper hover:text-copper-dark cursor-pointer">
              + Add Zone
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                  Zone
                </th>
                <th className="text-left py-2 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                  Delivery Fee
                </th>
                <th className="text-left py-2 text-xs uppercase tracking-wider text-charcoal-soft font-medium">
                  Est. Time
                </th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {deliveryZones.map((zone) => (
                <tr key={zone.zone} className="border-b border-border last:border-b-0">
                  <td className="py-3">{zone.zone}</td>
                  <td className="py-3 font-medium">{zone.fee}</td>
                  <td className="py-3 text-charcoal-soft">{zone.time}</td>
                  <td className="py-3 text-right">
                    <button className="text-xs text-copper hover:text-copper-dark cursor-pointer">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              { label: "New order alerts", desc: "Get notified on WhatsApp when a new order comes in", checked: true },
              { label: "Low stock alerts", desc: "Alert when product stock reaches 1 or 0", checked: true },
              { label: "Payment confirmations", desc: "Receive payment confirmation notifications", checked: true },
              { label: "Daily sales summary", desc: "Get a daily summary of sales at 9 PM", checked: false },
              { label: "Customer review alerts", desc: "Get notified when a customer leaves a review", checked: false },
            ].map((notif) => (
              <label
                key={notif.label}
                className="flex items-start justify-between py-2 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-medium">{notif.label}</div>
                  <div className="text-xs text-charcoal-soft">{notif.desc}</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={notif.checked}
                  className="accent-copper mt-1"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-4">Announcement Bar</h3>
          <div>
            <label className="text-xs uppercase tracking-wider text-charcoal-soft mb-1 block">
              Message
            </label>
            <input
              className="input-base"
              defaultValue="New arrivals every week — Free delivery on orders over ₦15,000"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-charcoal-soft mt-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-copper" />
            Show announcement bar
          </label>
        </div>
      </div>
    </>
  );
}
