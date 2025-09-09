"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { Product } from "@/zod/schemas";
import { apolloClient } from "@/apollo/clientInstance";
import { ADD_ITEM, REMOVE_ITEM } from "@/apollo/queries";

export interface CartItemType {
  _id: string; // ბექის cartItem._id
  product: Product;
  quantity: number;
}

export interface VisitorType {
  _id: string;
  token: string;
  cartId: string;
}

interface CartState {
  visitor?: VisitorType;
  items: CartItemType[];
  setVisitor: (visitor: VisitorType) => void;
  addItem: (product: Product) => Promise<void>;
  decreaseItem: (cartItemId: string) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        visitor: undefined,
        items: [],
        setVisitor: (visitor) => set({ visitor }),
        addItem: async (product) => {
          if (!get().visitor) return;

          let addedItem: CartItemType | undefined;
          try {
            const result = await apolloClient.mutate({
              mutation: ADD_ITEM,
              variables: { input: { productId: product._id, quantity: 1 } },
            });

            if (!result.data) return;
            addedItem = (result.data as any).addItem.items.find(
              (i: CartItemType) => i.product._id === product._id
            );
            if (!addedItem) return;
          } catch (err) {
            console.error("Failed to add item to backend:", err);
            return;
          }

          const exists = get().items.find((i) => i.product._id === product._id);
          if (exists) {
            set({
              items: get().items.map((i) =>
                i.product._id === product._id
                  ? { ...i, quantity: i.quantity + 1, _id: addedItem!._id }
                  : i
              ),
            });
          } else {
            set({ items: [...get().items, addedItem!] });
          }
        },
        decreaseItem: async (cartItemId) => {
          const item = get().items.find((i) => i._id === cartItemId);
          if (!item) return;

          if (item.quantity > 1) {
            set({
              items: get().items.map((i) =>
                i._id === cartItemId ? { ...i, quantity: i.quantity - 1 } : i
              ),
            });
          } else {
            try {
              await apolloClient.mutate({
                mutation: REMOVE_ITEM,
                variables: { input: { cartItemId } },
              });
            } catch (err) {
              console.error("Failed to remove item from backend:", err);
              return;
            }

            set({
              items: get().items.filter((i) => i._id !== cartItemId),
            });
          }
        },
        removeItem: async (cartItemId) => {
          const item = get().items.find((i) => i._id === cartItemId);
          if (!item) return;

          try {
            await apolloClient.mutate({
              mutation: REMOVE_ITEM,
              variables: { input: { cartItemId } },
            });
          } catch (err) {
            console.error("Failed to remove item from backend:", err);
            return;
          }

          set({
            items: get().items.filter((i) => i._id !== cartItemId),
          });
        },
        clearCart: () => set({ items: [] }),
      }),
      { name: "cart-storage" }
    ),
    { name: "CartStore" }
  )
);
