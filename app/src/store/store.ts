"use client";

import { apolloClient } from "@/apollo/clientInstance";
import {
  ADD_ITEM,
  REMOVE_ITEM,
  UPDATE_ITEM_QUANTITY,
} from "@/apollo/mutations";
import {
  AddItemMutationResult,
  CartItemType,
  CartState,
  DiffItem,
} from "@/types/cart";
import {
  RemoveItemMutationResult,
  UpdateItemQuantityMutationResult,
} from "@/types/product";
import { cartSchema } from "@/zod/cart";
import { Product } from "@/zod/product";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        hasToken: false,
        items: [],
        cartHash: undefined,
        cartChanged: false,
        diff: [],
        acknowledged: false,

        setDiff: (diff: DiffItem[]) => set({ diff }),
        setCartChanged: (cartChanged: boolean) => set({ cartChanged }),

        // set token flag if cookie exists
        setHasToken: (value: boolean) => set({ hasToken: value }),

        setItems: ({
          items,
          cartHash,
        }: {
          items: CartItemType[];
          cartHash?: string;
        }) => set({ items, cartHash }),

        acknowledgeChanges: () => {
          const updatedItems: CartItemType[] = get()
            .items.map((item) => {
              const d = get().diff.find(
                (d) => d.productId === item.product._id
              );
              if (!d) return item;
              if (d.newQuantity !== undefined)
                return { ...item, quantity: d.newQuantity };
              return null; // remove if out of stock
            })
            .filter((i): i is CartItemType => i !== null);

          set({
            items: updatedItems,
            acknowledged: true,
            cartChanged: false,
            diff: [],
          });
        },

        syncWithBackend: (
          backendItems: CartItemType[],
          backendHash?: string
        ) => {
          const localItems = get().items;
          const newDiff: DiffItem[] = [];

          localItems.forEach((lItem) => {
            const bItem = backendItems.find(
              (i) => i.product._id === lItem.product._id
            );

            if (!bItem || bItem.product.availableQuantity === 0) {
              newDiff.push({
                productId: lItem.product._id,
                title: lItem.product.title,
                oldQuantity: lItem.quantity,
              });
              return;
            }

            if (bItem.product.availableQuantity < lItem.quantity) {
              newDiff.push({
                productId: lItem.product._id,
                title: lItem.product.title,
                oldQuantity: lItem.quantity,
                newQuantity: bItem.product.availableQuantity,
              });
            }
          });

          set({
            items: backendItems,
            cartHash: backendHash,
            diff: newDiff,
            cartChanged: newDiff.length > 0,
            acknowledged: false,
          });
        },

        // add new item to cart or increase quantity
        addItem: async (product: Product) => {
          const state = get();
          if (!state.hasToken) return; // only allow if token exists

          const exists = state.items.find((i) => i.product._id === product._id);
          if (exists) {
            await get().updateItemQuantity(product._id, exists.quantity + 1);
            return;
          }

          try {
            const result = await apolloClient.mutate<AddItemMutationResult>({
              mutation: ADD_ITEM,
              variables: { input: { productId: product._id, quantity: 1 } },
            });

            const addedCart = result.data?.addItem;
            if (!addedCart) return;

            const parseResult = cartSchema.safeParse(addedCart);
            if (!parseResult.success) {
              console.error("Invalid addItem response:", parseResult.error);
              return;
            }

            set({
              items: parseResult.data.items,
              cartHash: parseResult.data.hash,
            });
          } catch (err) {
            console.error("Failed to add item:", err);
          }
        },

        // update quantity of a cart item
        updateItemQuantity: async (productId: string, quantity: number) => {
          const state = get();
          const item = state.items.find((i) => i.product._id === productId);
          if (!item) return;

          if (item.quantity === quantity) return;

          try {
            const result =
              await apolloClient.mutate<UpdateItemQuantityMutationResult>({
                mutation: UPDATE_ITEM_QUANTITY,
                variables: { input: { cartItemId: item._id, quantity } },
              });

            const updatedCart = result.data?.updateItemQuantity;
            if (!updatedCart) return;

            const parseResult = cartSchema.safeParse(updatedCart);
            if (!parseResult.success) {
              console.error(
                "Invalid updateItemQuantity response:",
                parseResult.error
              );
              return;
            }

            set({
              items: parseResult.data.items,
              cartHash: parseResult.data.hash,
            });
          } catch (err) {
            console.error("Failed to update quantity:", err);
          }
        },

        // decrease quantity or remove item
        decreaseItem: async (productId: string) => {
          const item = get().items.find((i) => i.product._id === productId);
          if (!item) return;

          if (item.quantity > 1) {
            await get().updateItemQuantity(productId, item.quantity - 1);
          } else {
            await get().removeItem(productId);
          }
        },

        // remove item from cart
        removeItem: async (productId: string) => {
          const state = get();
          const item = state.items.find((i) => i.product._id === productId);
          if (!item) return;

          try {
            const result = await apolloClient.mutate<RemoveItemMutationResult>({
              mutation: REMOVE_ITEM,
              variables: { input: { cartItemId: item._id } },
            });

            const updatedCart = result.data?.removeItem;
            if (!updatedCart) return;

            const parseResult = cartSchema.safeParse(updatedCart);
            if (!parseResult.success) {
              console.error("Invalid removeItem response:", parseResult.error);
              return;
            }

            set({
              items: parseResult.data.items,
              cartHash:
                parseResult.data.items.length > 0
                  ? parseResult.data.hash
                  : undefined,
            });
          } catch (err) {
            console.error("Failed to remove item:", err);
          }
        },

        // clear cart locally
        clearCart: () => set({ items: [], cartHash: undefined }),
      }),
      { name: "cart-storage" } // persist key in localStorage
    ),
    { name: "CartStore" }
  )
);
