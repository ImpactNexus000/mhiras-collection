import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationPreferencesForm } from "@/components/store/notification-preferences-form";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?from=/account/notifications");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { marketingEmails: true },
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-charcoal transition-colors mb-4"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Back to account
      </Link>

      <h1 className="font-display text-3xl md:text-4xl font-light italic mb-2">
        Notifications
      </h1>
      <p className="text-sm text-charcoal-soft mb-6">
        Choose which emails you receive from us.
      </p>

      <NotificationPreferencesForm
        marketingEmails={user?.marketingEmails ?? true}
      />
    </div>
  );
}
