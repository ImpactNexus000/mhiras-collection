import { Metadata } from "next";
import { CartContent } from "@/components/store/cart-content";

export const metadata: Metadata = {
  title: "Shopping Cart",
};

export default function CartPage() {
  return <CartContent />;
}
