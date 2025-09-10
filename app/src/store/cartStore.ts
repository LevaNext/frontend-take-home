"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { apolloClient } from "@/apollo/clientInstance";
import { ADD_ITEM, GET_CART, REMOVE_ITEM } from "@/apollo/queries";
import { GetCartQueryResult } from "@/types/cart";
import z from "zod";
import { Product } from "@/zod/products";

export interface CartItemType {
  _id: string; // backend cartItem._id
  product: Product;
  quantity: number;
}

export interface VisitorType {
  _id: string;
  token: string;
  cartId: string;
}

// Zod schemas for validating backend response
const cartItemSchema = z.object({
  _id: z.string(),
  cartId: z.string(),
  product: z.object({
    _id: z.string(),
    title: z.string(),
    cost: z.number(),
    availableQuantity: z.number(),
    isArchived: z.boolean(),
  }),
  quantity: z.number(),
  updatedAt: z.string(),
  addedAt: z.string(),
});

const cartSchema = z.object({
  getCart: z.object({
    _id: z.string(),
    hash: z.string(),
    items: z.array(cartItemSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

interface CartState {
  visitor?: VisitorType;
  items: CartItemType[];
  setVisitor: (visitor: VisitorType) => void;
  addItem: (product: Product) => Promise<void>;
  decreaseItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        visitor: undefined,
        items: [],

        // Set visitor info
        setVisitor: (visitor) => set({ visitor }),

        // Add item to cart
        addItem: async (product) => {
          const cart = get();
          if (!cart.visitor) return;

          // If the product already exists → just increase quantity locally
          const exists = cart.items.find((i) => i.product._id === product._id);
          if (exists) {
            set({
              items: cart.items.map((i) =>
                i.product._id === product._id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            });
            return; // do not send mutation to backend
          }

          // New product → send mutation to backend
          try {
            const result = await apolloClient.mutate({
              mutation: ADD_ITEM,
              variables: { input: { productId: product._id, quantity: 1 } },
            });

            if (!result.data) return;

            // Find the added item from backend response
            const addedItem = (result.data as any).addItem.items.find(
              (i: CartItemType) => i.product._id === product._id
            );
            if (!addedItem) return;

            // Update local state
            set({ items: [...cart.items, addedItem] });
          } catch (err) {
            console.error("Failed to add item to backend:", err);
          }
        },

        // Decrease quantity of item
        decreaseItem: async (productId) => {
          const item = get().items.find((i) => i.product._id === productId);
          if (!item) return;

          if (item.quantity > 1) {
            // Only local update for quantity > 1
            set((state) => ({
              items: state.items.map((i) =>
                i.product._id === productId
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              ),
            }));
          } else {
            // If quantity === 1 → remove from backend + local state
            await get().removeItem(productId);
          }
        },

        // Remove item from cart (backend + local)
        removeItem: async (productId) => {
          try {
            // 1️⃣ Fetch current cart from backend
            const result = await apolloClient.query<GetCartQueryResult>({
              query: GET_CART,
              fetchPolicy: "network-only",
            });

            if (!result.data) {
              console.error("GET_CART returned no data");
              return;
            }

            // 2️⃣ Validate backend response using Zod
            const parseResult = cartSchema.safeParse(result.data);
            if (!parseResult.success) {
              console.error(
                "Invalid cart data from server:",
                parseResult.error
              );
              return;
            }

            const cart = parseResult.data.getCart;

            // 3️⃣ Find the CartItem _id corresponding to the product
            const item = cart.items.find((i) => i.product._id === productId);
            if (!item) return;

            // 4️⃣ Send REMOVE_ITEM mutation to backend
            await apolloClient.mutate({
              mutation: REMOVE_ITEM,
              variables: { input: { cartItemId: item._id } },
            });

            // 5️⃣ Update local state to remove the item
            set((state) => ({
              items: state.items.filter((i) => i.product._id !== productId),
            }));
          } catch (err) {
            console.error("Failed to remove item:", err);
          }
        },

        // Clear entire cart locally
        clearCart: () => set({ items: [] }),
      }),
      { name: "cart-storage" } // persist key
    ),
    { name: "CartStore" } // devtools name
  )
);
