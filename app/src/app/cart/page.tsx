"use client";

import { GET_CART } from "@/apollo/queries";
import { useCartStore } from "@/store/store";
import { getCartSchema } from "@/zod/cart";
import { useQuery } from "@apollo/client/react";
import React, { useEffect, useState } from "react";

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

  const { data } = useQuery(GET_CART, {
    fetchPolicy: "network-only",
    pollInterval: 5 * 60 * 1000, // 5 min
  });

  // backend cart changes
  useEffect(() => {
    if (!data) return;

    const parsed = getCartSchema.safeParse(data);
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

      // out of stock or removed
      if (!bItem || bItem.product.availableQuantity === 0) {
        newDiff.push({
          productId: lItem.product._id,
          title: lItem.product.title,
          oldQuantity: lItem.quantity,
        });
        return;
      }

      // quantity reduced
      if (bItem.product.availableQuantity < lItem.quantity) {
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
    setAcknowledged(false);

    // always update cartHash and backend items for reference
    setItems({
      items: backendCart.items.map((i) => ({
        _id: i._id,
        product: i.product,
        quantity: i.quantity,
      })),
      cartHash: backendCart.hash,
    });
  }, [data, setItems]);

  // acknowledge backend changes
  const handleAcknowledge = () => {
    const localItems = useCartStore.getState().items;

    const updatedItems = localItems
      .map((lItem) => {
        const d = diff.find((d) => d.productId === lItem.product._id);
        if (!d) return lItem;
        if (d.newQuantity !== undefined) {
          return { ...lItem, quantity: d.newQuantity };
        }
        return null; // remove if out of stock
      })
      .filter(Boolean) as typeof localItems;

    setItems({ items: updatedItems });
    setAcknowledged(true);
    setCartChanged(false);
    setDiff([]);
  };

  const isCheckoutDisabled = cartChanged && !acknowledged;

  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.cost * item.quantity,
    0
  );

  if (items.length === 0)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 text-2xl font-medium">Your cart is empty</p>
      </div>
    );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Backend update notification */}
      {cartChanged && !acknowledged && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded shadow-sm mb-4">
          <p className="font-medium text-yellow-800">
            🛒 Cart has been updated by the backend. Please acknowledge changes:
          </p>
          <ul className="list-disc ml-5 mt-2 text-yellow-900">
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
            className="mt-3 px-4 py-2 bg-yellow-600 text-white font-semibold rounded hover:bg-yellow-700 transition"
            onClick={handleAcknowledge}
          >
            OK
          </button>
        </div>
      )}

      {/* Cart + Summary */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            const outOfStock = item.product.availableQuantity === 0;
            return (
              <div
                key={item.product._id}
                className="border rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {item.product.title}
                  </p>
                  <p className="text-gray-600 font-medium">
                    ${item.product.cost}
                  </p>
                </div>

                {outOfStock ? (
                  <p className="text-red-600 font-bold">Out of stock</p>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decreaseItem(item.product._id)}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-300 transition"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        disabled={
                          item.quantity >= item.product.availableQuantity
                        }
                        onClick={() => addItem(item.product)}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-300 transition disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="px-3 py-1 bg-red-500 !text-white font-semibold rounded hover:bg-red-600 transition w-full"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full max-h-fit lg:w-80 border rounded-2xl p-4 shadow-sm bg-amber-100 flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Checkout Summary
          </h3>

          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="font-bold text-gray-900">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <button
            disabled={isCheckoutDisabled}
            className={`w-full px-4 py-2 font-semibold rounded transition ${
              isCheckoutDisabled
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
