import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getStoreSettings } from "@/lib/queries/settings";
import { db } from "@/lib/db";
import { StockpileSettings } from "@/components/admin/stockpile-settings";
import { StoreInfoSettings } from "@/components/admin/store-info-settings";
import { AnnouncementSettings } from "@/components/admin/announcement-settings";
import { BankDetailsSettings } from "@/components/admin/bank-details-settings";

export const metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const [settings, deliveryZoneCount] = await Promise.all([
    getStoreSettings(),
    db.deliveryZone.count({ where: { isActive: true } }),
  ]);

  const paystackConfigured = !!process.env.PAYSTACK_SECRET_KEY;
  const resendConfigured = !!process.env.RESEND_API_KEY;

  return (
    <>
      <div className="mb-5">
        <h1 className="font-display text-3xl md:text-4xl font-light italic">
          Settings
        </h1>
        <p className="text-sm text-charcoal-soft mt-1">
          Storefront-wide settings. Each card saves on its own.
        </p>
      </div>

      <div className="space-y-5 max-w-3xl">
        <StoreInfoSettings
          storeName={settings.storeName}
          contactEmail={settings.contactEmail}
          whatsappNumber={settings.whatsappNumber}
          instagramHandle={settings.instagramHandle}
        />

        <AnnouncementSettings
          announcementText={settings.announcementText}
          announcementVisible={settings.announcementVisible}
        />

        <BankDetailsSettings
          bankName={settings.bankName}
          bankAccountNumber={settings.bankAccountNumber}
          bankAccountName={settings.bankAccountName}
        />

        <StockpileSettings stockpileExpiryDays={settings.stockpileExpiryDays} />

        {/* Delivery zones — managed on its own page */}
        <Link
          href="/admin/delivery"
          className="bg-white border border-border rounded-lg p-5 flex items-center justify-between hover:bg-cream-dark transition-colors"
        >
          <div>
            <h3 className="text-sm font-medium mb-1">Delivery Zones</h3>
            <p className="text-xs text-charcoal-soft">
              {deliveryZoneCount} active zone{deliveryZoneCount === 1 ? "" : "s"}.
              Manage fees + states on the Delivery page.
            </p>
          </div>
          <ArrowRight size={16} aria-hidden="true" className="text-charcoal-soft" />
        </Link>

        {/* Integrations — read-only status */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-1">Integrations</h3>
          <p className="text-xs text-charcoal-soft mb-4">
            Configured via environment variables — change them on your hosting
            provider, not here.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Paystack</div>
                <div className="text-xs text-charcoal-soft">
                  Card + bank transfer checkout
                </div>
              </div>
              <StatusPill ok={paystackConfigured} okLabel="Connected" missingLabel="No key set" />
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Resend (email)</div>
                <div className="text-xs text-charcoal-soft">
                  Order confirmations, payment + status updates
                </div>
              </div>
              <StatusPill ok={resendConfigured} okLabel="Connected" missingLabel="No key set" />
            </li>
          </ul>
        </div>

        {/* Notifications — explainer, not toggles */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-1">Customer Notifications</h3>
          <p className="text-xs text-charcoal-soft mb-3">
            Emails fire automatically when these events happen — no toggles
            needed. Requires Resend to be configured above.
          </p>
          <ul className="text-sm text-charcoal-soft space-y-1.5">
            <li>• Order confirmation (immediate and stockpile)</li>
            <li>• Payment confirmed</li>
            <li>• Order processing, shipped, and delivered</li>
            <li>• Welcome email on signup</li>
            <li>
              • New stockpile delivery requests — sent to{" "}
              <code className="bg-cream-dark px-1 rounded text-[11px]">
                ADMIN_EMAIL
              </code>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

function StatusPill({
  ok,
  okLabel,
  missingLabel,
}: {
  ok: boolean;
  okLabel: string;
  missingLabel: string;
}) {
  return ok ? (
    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
      <CheckCircle2 size={12} aria-hidden="true" />
      {okLabel}
    </span>
  ) : (
    <span className="text-xs px-2.5 py-1 rounded-full bg-cream-dark text-charcoal-soft font-medium">
      {missingLabel}
    </span>
  );
}
