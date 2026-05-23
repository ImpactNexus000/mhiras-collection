"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getDeliveryFeeByState } from "@/lib/queries/delivery";
import { generateDeliveryRequestNumber } from "@/lib/queries/stockpile";
import { sendAdminDeliveryRequest } from "@/lib/email";

/**
 * Create a delivery request for selected stockpiled items. The items are
 * assigned to the new request; the delivery fee is paid separately (Paystack).
 */
export async function createDeliveryRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }
  const userId = session.user.id;

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const state = (formData.get("state") as string)?.trim();
  const lga = (formData.get("lga") as string)?.trim();
  const itemIdsJson = formData.get("itemIds") as string;

  if (!firstName || !lastName || !phone || !address || !state) {
    return { error: "Please fill in all delivery details." };
  }

  let itemIds: string[];
  try {
    itemIds = JSON.parse(itemIdsJson);
  } catch {
    return { error: "Invalid item selection." };
  }
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return { error: "Select at least one item to have delivered." };
  }

  // Delivery fee from the zone covering the chosen state
  const zone = await getDeliveryFeeByState(state);
  if (!zone) {
    return { error: "We don't deliver to that state yet." };
  }

  const requestNumber = await generateDeliveryRequestNumber();

  try {
    const deliveryRequest = await db.$transaction(async (tx) => {
      const deliveryAddress = await tx.address.create({
        data: {
          userId,
          firstName,
          lastName,
          phone,
          address,
          city: lga || state,
          state,
          lga: lga || null,
        },
      });

      const newRequest = await tx.deliveryRequest.create({
        data: {
          requestNumber,
          userId,
          addressId: deliveryAddress.id,
          deliveryFee: zone.fee,
        },
      });

      // Assign the selected items — only those that are still unassigned and
      // genuinely belong to this user's paid stockpile orders.
      const assigned = await tx.orderItem.updateMany({
        where: {
          id: { in: itemIds },
          deliveryRequestId: null,
          order: {
            userId,
            fulfillmentType: "STOCKPILE",
            paymentStatus: "PAID",
          },
        },
        data: { deliveryRequestId: newRequest.id },
      });

      if (assigned.count !== itemIds.length) {
        // Roll back — some items were invalid or already assigned.
        throw new Error("ITEMS_UNAVAILABLE");
      }

      return newRequest;
    });

    // Notify admin so Mhiras can fulfill. Best-effort + after the response.
    const [user, items] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true },
      }),
      db.orderItem.findMany({
        where: { deliveryRequestId: deliveryRequest.id },
        include: { product: { select: { name: true } } },
      }),
    ]);
    if (user) {
      after(() =>
        sendAdminDeliveryRequest({
          requestNumber: deliveryRequest.requestNumber,
          customerName: `${user.firstName} ${user.lastName}`,
          customerEmail: user.email,
          customerPhone: phone,
          itemCount: items.reduce((n, it) => n + it.quantity, 0),
          items: items.map((it) => ({
            name: it.product.name,
            quantity: it.quantity,
            size: it.size,
          })),
          deliveryFee: zone.fee,
          addressLine: address,
          city: lga || state,
          state,
        })
      );
    }

    return {
      success: true,
      deliveryRequestId: deliveryRequest.id,
      requestNumber: deliveryRequest.requestNumber,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "ITEMS_UNAVAILABLE") {
      return {
        error:
          "Some selected items are no longer available for delivery. Please refresh and try again.",
      };
    }
    throw error;
  }
}
