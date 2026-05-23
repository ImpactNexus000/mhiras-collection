"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  addToCart,
  clearCart as clearCartAction,
  getCart,
  getProductsForCart,
  mergeGuestCart,
  removeFromCart,
  updateCartItemQuantity,
} from "@/app/actions/cart";

export interface CartItem {
  /** DB id for authed cart items; synthetic `${productId}::${size}` for guests. */
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
  addItem: (
    productId: string,
    quantity?: number,
    size?: string
  ) => Promise<{ error?: string }>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

const GUEST_CART_KEY = "mhiras-guest-cart-v1";

interface GuestEntry {
  productId: string;
  quantity: number;
  size: string;
}

function readGuestCart(): GuestEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is GuestEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof e.productId === "string" &&
        typeof e.quantity === "number" &&
        e.quantity > 0 &&
        typeof e.size === "string"
    );
  } catch {
    return [];
  }
}

function writeGuestCart(entries: GuestEntry[]) {
  if (typeof window === "undefined") return;
  if (entries.length === 0) {
    window.localStorage.removeItem(GUEST_CART_KEY);
  } else {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(entries));
  }
}

function guestKey(productId: string, size: string) {
  return `${productId}::${size}`;
}

type LoadedProduct = Awaited<ReturnType<typeof getProductsForCart>>[number];

function buildGuestItems(
  entries: GuestEntry[],
  products: LoadedProduct[]
): CartItem[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: CartItem[] = [];
  for (const entry of entries) {
    const product = byId.get(entry.productId);
    if (!product || product.stock <= 0) continue;
    items.push({
      cartItemId: guestKey(entry.productId, entry.size),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      size: entry.size || product.size,
      condition: product.condition,
      price: product.sellingPrice,
      originalPrice: product.originalPrice,
      image: product.imageUrl,
      quantity: Math.min(entry.quantity, product.stock),
      maxStock: product.stock,
    });
  }
  return items;
}

function mapDbCartToItems(
  cart: Awaited<ReturnType<typeof getCart>>
): CartItem[] {
  if (!cart) return [];
  return cart.items.map((item) => ({
    cartItemId: item.id,
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    category: item.product.category?.name ?? "",
    size: item.size || item.product.size,
    condition: item.product.condition,
    price: item.product.sellingPrice,
    originalPrice: item.product.originalPrice,
    image: item.product.images[0]?.url ?? null,
    quantity: item.quantity,
    maxStock: item.product.stock,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tracks the userId we last reconciled for. When the session transitions
  // null → userId (i.e. signin), we run the guest-cart merge exactly once.
  const lastUserIdRef = useRef<string | null | undefined>(undefined);

  /** Re-read the cart from whichever source is authoritative right now. */
  const refreshCart = useCallback(async () => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.id) {
      try {
        const cart = await getCart();
        setItems(mapDbCartToItems(cart));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Guest path — read localStorage, hydrate product details from the server.
    const entries = readGuestCart();
    if (entries.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const products = await getProductsForCart(
        Array.from(new Set(entries.map((e) => e.productId)))
      );
      setItems(buildGuestItems(entries, products));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status, session?.user?.id]);

  // On signin, merge the local guest cart into the DB, then refresh from
  // the DB so the merged state is canonical.
  useEffect(() => {
    if (status === "loading") return;

    const currentUserId = session?.user?.id ?? null;
    const previousUserId = lastUserIdRef.current;
    lastUserIdRef.current = currentUserId;

    // First run only — just load whatever's current.
    if (previousUserId === undefined) {
      refreshCart();
      return;
    }

    // Transition guest → signed in: merge & adopt the DB as truth.
    if (!previousUserId && currentUserId) {
      const entries = readGuestCart();
      if (entries.length > 0) {
        mergeGuestCart(entries)
          .catch(() => undefined)
          .finally(() => {
            writeGuestCart([]);
            refreshCart();
          });
      } else {
        refreshCart();
      }
      return;
    }

    // Transition signed in → signed out (or user swap): drop in-memory items
    // so we don't leak the previous user's cart, then re-read localStorage.
    if (previousUserId && previousUserId !== currentUserId) {
      setItems([]);
      refreshCart();
      return;
    }

    // Same user as before — nothing to reconcile.
  }, [status, session?.user?.id, refreshCart]);

  const isAuthed = status === "authenticated" && !!session?.user?.id;

  const addItemFn = useCallback(
    async (productId: string, quantity: number = 1, size: string = "") => {
      if (isAuthed) {
        const result = await addToCart(productId, quantity, size);
        if (result.error) return { error: result.error };
        await refreshCart();
        return {};
      }

      // Guest — update localStorage, then re-fetch product info for display.
      const entries = readGuestCart();
      const key = guestKey(productId, size);
      const idx = entries.findIndex(
        (e) => guestKey(e.productId, e.size) === key
      );

      // Stock check — clamp against the latest product info.
      const [product] = await getProductsForCart([productId]);
      if (!product) return { error: "Product not found." };
      if (product.stock <= 0) return { error: "Sold out." };

      const existingQty = idx >= 0 ? entries[idx].quantity : 0;
      const desired = existingQty + quantity;
      if (desired > product.stock) {
        return {
          error:
            existingQty > 0
              ? `You already have ${existingQty} in your cart and only ${product.stock} are available.`
              : `Only ${product.stock} left in stock.`,
        };
      }

      if (idx >= 0) {
        entries[idx] = { ...entries[idx], quantity: desired };
      } else {
        entries.push({ productId, quantity, size });
      }
      writeGuestCart(entries);
      await refreshCart();
      return {};
    },
    [isAuthed, refreshCart]
  );

  const removeItemFn = useCallback(
    async (cartItemId: string) => {
      // Optimistic — UI updates instantly.
      setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));

      if (isAuthed) {
        await removeFromCart(cartItemId);
        await refreshCart();
        return;
      }

      const entries = readGuestCart();
      writeGuestCart(
        entries.filter((e) => guestKey(e.productId, e.size) !== cartItemId)
      );
    },
    [isAuthed, refreshCart]
  );

  const updateQuantityFn = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItemFn(cartItemId);
        return;
      }
      // Optimistic update — UI changes instantly, no reload.
      setItems((prev) =>
        prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity } : i
        )
      );

      if (isAuthed) {
        await updateCartItemQuantity(cartItemId, quantity);
        await refreshCart();
        return;
      }

      const entries = readGuestCart();
      const idx = entries.findIndex(
        (e) => guestKey(e.productId, e.size) === cartItemId
      );
      if (idx >= 0) {
        entries[idx] = { ...entries[idx], quantity };
        writeGuestCart(entries);
      }
    },
    [isAuthed, refreshCart, removeItemFn]
  );

  const clearCartFn = useCallback(async () => {
    setItems([]);
    if (isAuthed) {
      await clearCartAction();
    } else {
      writeGuestCart([]);
    }
  }, [isAuthed]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        loading,
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
