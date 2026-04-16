"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart as clearCartAction,
} from "@/app/actions/cart";

export interface CartItem {
  cartItemId: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  size?: string | null;
  condition?: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<{ error?: string }>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const mapCartToItems = (cart: Awaited<ReturnType<typeof getCart>>): CartItem[] => {
    if (!cart) return [];
    return cart.items.map((item) => ({
      cartItemId: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      category: item.product.category?.name ?? "",
      size: item.product.size,
      condition: item.product.condition,
      price: item.product.sellingPrice,
      originalPrice: item.product.originalPrice,
      image: item.product.images[0]?.url ?? null,
      quantity: item.quantity,
      maxStock: item.product.stock,
    }));
  };

  const refreshCart = useCallback(async () => {
    try {
      const cart = await getCart();
      setItems(mapCartToItems(cart));
    } catch {
      // User not signed in or error — empty cart
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart from database on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const addItemFn = useCallback(
    async (productId: string, quantity: number = 1) => {
      const result = await addToCart(productId, quantity);
      if (result.error) {
        return { error: result.error };
      }
      await refreshCart();
      return {};
    },
    [refreshCart]
  );

  const removeItemFn = useCallback(
    async (cartItemId: string) => {
      startTransition(async () => {
        // Optimistic update
        setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
        await removeFromCart(cartItemId);
        await refreshCart();
      });
    },
    [refreshCart]
  );

  const updateQuantityFn = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItemFn(cartItemId);
        return;
      }
      startTransition(async () => {
        // Optimistic update
        setItems((prev) =>
          prev.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          )
        );
        await updateCartItemQuantity(cartItemId, quantity);
        await refreshCart();
      });
    },
    [refreshCart, removeItemFn]
  );

  const clearCartFn = useCallback(async () => {
    startTransition(async () => {
      setItems([]);
      await clearCartAction();
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        loading: loading || isPending,
        addItem: addItemFn,
        removeItem: removeItemFn,
        updateQuantity: updateQuantityFn,
        clearCart: clearCartFn,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
