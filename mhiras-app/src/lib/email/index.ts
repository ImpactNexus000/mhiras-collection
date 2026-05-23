import { SITE_URL } from "@/lib/site";
import { sendEmail } from "./send";
import {
  OrderConfirmationEmail,
  type OrderConfirmationItem,
} from "./templates/order-confirmation";
import { PaymentConfirmedEmail } from "./templates/payment-confirmed";
import {
  OrderStatusEmail,
  type OrderStatusKind,
} from "./templates/order-status";
import { WelcomeEmail } from "./templates/welcome";
import {
  AdminDeliveryRequestEmail,
  type AdminDeliveryRequestItem,
} from "./templates/admin-delivery-request";

const orderUrl = (id: string) => `${SITE_URL}/order/${id}`;
const stockpileUrl = () => `${SITE_URL}/account/stockpile`;
const adminStockpileUrl = () => `${SITE_URL}/admin/stockpile`;
const shopUrl = () => `${SITE_URL}/shop`;

interface OrderConfirmationArgs {
  to: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  fulfillmentType: "IMMEDIATE" | "STOCKPILE";
  stockpileExpiresAt?: Date | null;
}

export function sendOrderConfirmation(args: OrderConfirmationArgs) {
  const url =
    args.fulfillmentType === "STOCKPILE" ? stockpileUrl() : orderUrl(args.orderId);
  return sendEmail({
    to: args.to,
    subject:
      args.fulfillmentType === "STOCKPILE"
        ? `Your stockpile order ${args.orderNumber} is confirmed`
        : `Your order ${args.orderNumber} is confirmed`,
    template: OrderConfirmationEmail({
      customerName: args.customerName,
      orderNumber: args.orderNumber,
      items: args.items,
      subtotal: args.subtotal,
      deliveryFee: args.deliveryFee,
      discount: args.discount,
      total: args.total,
      fulfillmentType: args.fulfillmentType,
      stockpileExpiresAt: args.stockpileExpiresAt,
      orderUrl: url,
    }),
  });
}

interface PaymentConfirmedArgs {
  to: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  total: number;
  channel?: string | null;
  fulfillmentType: "IMMEDIATE" | "STOCKPILE";
}

export function sendPaymentConfirmed(args: PaymentConfirmedArgs) {
  const url =
    args.fulfillmentType === "STOCKPILE" ? stockpileUrl() : orderUrl(args.orderId);
  return sendEmail({
    to: args.to,
    subject: `Payment received for ${args.orderNumber}`,
    template: PaymentConfirmedEmail({
      customerName: args.customerName,
      orderNumber: args.orderNumber,
      total: args.total,
      channel: args.channel,
      fulfillmentType: args.fulfillmentType,
      orderUrl: url,
    }),
  });
}

interface OrderStatusArgs {
  to: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  status: OrderStatusKind;
  note?: string | null;
}

export function sendOrderStatusUpdate(args: OrderStatusArgs) {
  const subjects: Record<OrderStatusKind, string> = {
    PROCESSING: `Order ${args.orderNumber} is being prepared`,
    SHIPPED: `Order ${args.orderNumber} is on the way`,
    DELIVERED: `Order ${args.orderNumber} delivered`,
  };
  return sendEmail({
    to: args.to,
    subject: subjects[args.status],
    template: OrderStatusEmail({
      customerName: args.customerName,
      orderNumber: args.orderNumber,
      status: args.status,
      note: args.note,
      orderUrl: orderUrl(args.orderId),
    }),
  });
}

interface WelcomeArgs {
  to: string;
  customerName: string;
}

export function sendWelcomeEmail(args: WelcomeArgs) {
  return sendEmail({
    to: args.to,
    subject: "Welcome to Mhiras Collection",
    template: WelcomeEmail({
      customerName: args.customerName,
      shopUrl: shopUrl(),
    }),
  });
}

interface AdminDeliveryRequestArgs {
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemCount: number;
  items: AdminDeliveryRequestItem[];
  deliveryFee: number;
  addressLine: string;
  city: string;
  state: string;
}

export function sendAdminDeliveryRequest(args: AdminDeliveryRequestArgs) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[email] ADMIN_EMAIL not set; skipping admin notification");
    return Promise.resolve();
  }
  return sendEmail({
    to: adminEmail,
    subject: `New stockpile delivery request ${args.requestNumber}`,
    template: AdminDeliveryRequestEmail({
      requestNumber: args.requestNumber,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      itemCount: args.itemCount,
      items: args.items,
      deliveryFee: args.deliveryFee,
      addressLine: args.addressLine,
      city: args.city,
      state: args.state,
      adminUrl: adminStockpileUrl(),
    }),
  });
}
