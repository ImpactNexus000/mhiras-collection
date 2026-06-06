import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { releaseOrderStock } from "@/lib/stock";

export const dynamic = "force-dynamic";

// Card orders reserve their stock at placement (before Paystack). If the
// customer never completes payment — closes the tab, no webhook ever fires —
// the items would stay locked out of the catalogue. After this window we
// cancel such orders and return their stock. Pay-on-delivery and bank-transfer
// orders are deliberately excluded: those are legitimately unpaid-but-real.
const HOLD_MINUTES = 15;

export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is
  // configured on the project. Reject anything else so the route isn't a public
  // "cancel my pending orders" endpoint.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);

  const stale = await db.order.findMany({
    where: {
      paymentMethod: "CARD",
      paymentStatus: "PENDING",
      status: "PENDING",
      stockReleased: false,
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  let released = 0;
  for (const order of stale) {
    await db.$transaction(async (tx) => {
      // Re-guard inside the transaction: only cancel if the order is *still*
      // unpaid and unreleased, so we never clobber a charge.success that lands
      // at the same moment.
      const claimed = await tx.order.updateMany({
        where: {
          id: order.id,
          paymentStatus: "PENDING",
          status: "PENDING",
          stockReleased: false,
        },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      if (claimed.count === 0) return;

      await releaseOrderStock(tx, order.id);
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: "Auto-cancelled — payment not completed",
          note: `No payment within ${HOLD_MINUTES} minutes; items returned to stock.`,
        },
      });
      released++;
    });
  }

  return NextResponse.json({ checked: stale.length, released });
}
