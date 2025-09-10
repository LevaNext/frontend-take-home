"use client";

import React, { useState, useEffect } from "react";
import { useCartStore, CartItemType } from "@/store/cartStore";
import { apolloClient } from "@/apollo/clientInstance";
import { GET_CART } from "@/apollo/queries";
import { z } from "zod";
import { useQuery } from "@apollo/client/react";

// -------------------
// Zod schemas
// -------------------
const productSchema = z.object({
  _id: z.string(),
  title: z.string(),
  cost: z.number(),
  availableQuantity: z.number(),
  isArchived: z.boolean().optional(),
});

const cartItemSchema = z.object({
  _id: z.string(),
  cartId: z.string(),
  product: productSchema,
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

interface DiffItem {
  productId: string;
  title: string;
  oldQuantity: number;
  newQuantity?: number; // undefined if out of stock
}

const CartPage: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore.setState;
  const addItem = useCartStore((state) => state.addItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const [acknowledged, setAcknowledged] = useState(false);
  const [cartChanged, setCartChanged] = useState(false);
  const [diff, setDiff] = useState<DiffItem[]>([]);

  // -------------------
  // GraphQL query with polling (every 5 min)
  // -------------------
  const { data } = useQuery(GET_CART, {
    fetchPolicy: "network-only",
    pollInterval: 5 * 60 * 1000, // 5 minutes
  });

  // -------------------
  // Handle diff when data changes
  // -------------------
  useEffect(() => {
    if (!data) return;

    const parsed = cartSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Invalid GET_CART data:", parsed.error);
      return;
    }

    const backendCart = parsed.data.getCart;
    const localItems = useCartStore.getState().items;

    const newDiff: DiffItem[] = [];

    localItems.forEach((lItem) => {
      const bItem = backendCart.items.find(
        (i) => i.product._id === lItem.product._id
      );

      if (!bItem || bItem.product.availableQuantity === 0) {
        // Out of stock
        newDiff.push({
          productId: lItem.product._id,
          title: lItem.product.title,
          oldQuantity: lItem.quantity,
        });
        return;
      }

      if (bItem.product.availableQuantity < lItem.quantity) {
        // Quantity reduced
        newDiff.push({
          productId: lItem.product._id,
          title: lItem.product.title,
          oldQuantity: lItem.quantity,
          newQuantity: bItem.product.availableQuantity,
        });
      }
    });

    setDiff(newDiff);
    setCartChanged(newDiff.length > 0);
    setAcknowledged(false); // ✅ Reset acknowledged on every poll
  }, [data]);

  // -------------------
  // Acknowledge handler
  // -------------------
  const handleAcknowledge = () => {
    const localItems = useCartStore.getState().items;

    const updatedItems = localItems
      .map((lItem) => {
        const d = diff.find((d) => d.productId === lItem.product._id);
        if (!d) return lItem;
        if (d.newQuantity !== undefined) {
          return { ...lItem, quantity: d.newQuantity };
        }
        return null; // out of stock → remove
      })
      .filter(Boolean) as typeof localItems;

    setItems({ items: updatedItems });
    setAcknowledged(true);
    setCartChanged(false);
    setDiff([]);
  };

  if (items.length === 0) return <p>Your cart is empty</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {cartChanged && !acknowledged && (
        <div className="bg-yellow-200 p-3 rounded">
          <p>
            🛒 Cart has been updated by the backend. Please acknowledge changes:
          </p>
          <ul className="list-disc ml-5 mt-2">
            {diff.map((d) => (
              <li key={d.productId}>
                {d.title}:{" "}
                {d.newQuantity !== undefined
                  ? `Quantity reduced from ${d.oldQuantity} to ${d.newQuantity}`
                  : "Out of stock"}
              </li>
            ))}
          </ul>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleAcknowledge}
          >
            OK
          </button>
        </div>
      )}

      {items.map((item) => {
        const outOfStock = item.product.availableQuantity === 0;
        return (
          <div
            key={item.product._id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{item.product.title}</p>
              <p className="text-gray-600">{item.product.cost}$</p>
            </div>
            {outOfStock ? (
              <p className="text-red-600 font-bold">Out of stock</p>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => decreaseItem(item.product._id)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => addItem(item.product)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="ml-2 text-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CartPage;
