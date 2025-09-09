"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/zod/schemas";
import { apolloClient } from "@/apollo/clientInstance";
import { GET_CART } from "@/apollo/queries";

const CartPage: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const [acknowledged, setAcknowledged] = useState(false);
  const [cartChanged, setCartChanged] = useState(false);

  // ✅ Fetch cart from backend
  useEffect(() => {
    async function fetchCart() {
      try {
        const { data } = await apolloClient.query({
          query: GET_CART,
          fetchPolicy: "network-only",
        });

        console.log("GET_CART response:", data);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    }

    fetchCart();
  }, []);

  const handleAcknowledge = () => {
    setAcknowledged(true);
    setCartChanged(false);
  };

  if (items.length === 0) return <p>Your cart is empty</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {cartChanged && !acknowledged && (
        <div className="bg-yellow-200 p-3 rounded">
          <p>
            Cart has been updated by the backend. Please acknowledge changes.
          </p>
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
