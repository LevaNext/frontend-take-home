"use client";

import { GET_CART } from "@/apollo/queries";
import { CartChangeModal } from "@/components/CartChangeModal";
import { useCartStore } from "@/store/store";
import { getCartSchema } from "@/zod/cart";
import { useQuery } from "@apollo/client/react";
import React, { useEffect } from "react";

const CartPage: React.FC = () => {
  const {
    items,
    addItem,
    decreaseItem,
    removeItem,
    acknowledged,
    cartChanged,
  } = useCartStore();

  const { data, loading } = useQuery(GET_CART, {
    fetchPolicy: "network-only",
    pollInterval: 5 * 60 * 1000, // 5 min
  });

  // backend cart changes
  useEffect(() => {
    if (!data) return;

    const parsed = getCartSchema.safeParse(data);
    if (!parsed.success) return;

    const backendItems = parsed.data.getCart.items;
    const localItems = useCartStore.getState().items;

    const newDiff = localItems.flatMap((lItem) => {
      const bItem = backendItems.find(
        (i) => i.product._id === lItem.product._id
      );

      if (!bItem || bItem.product.availableQuantity === 0) {
        return [
          {
            productId: lItem.product._id,
            title: lItem.product.title,
            oldQuantity: lItem.quantity,
          },
        ];
      }

      if (bItem.quantity < lItem.quantity) {
        return [
          {
            productId: lItem.product._id,
            title: lItem.product.title,
            oldQuantity: lItem.quantity,
            newQuantity: bItem.quantity,
          },
        ];
      }

      return [];
    });

    // set items + update cartChanged/diff
    useCartStore.setState({
      items: backendItems.map((i) => ({
        _id: i._id,
        product: i.product,
        quantity: i.quantity,
      })),
      cartHash: parsed.data.getCart.hash,
      cartChanged: newDiff.length > 0,
      diff: newDiff,
      acknowledged: false,
    });
  }, [data]);

  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.cost * item.quantity,
    0
  );
  const summaryBtn = loading || (cartChanged && !acknowledged);

  if (items.length === 0)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 text-2xl font-medium">Your cart is empty</p>
      </div>
    );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Cart change modal */}
      <CartChangeModal />

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
            disabled={summaryBtn}
            className={`w-full px-4 py-2 font-semibold rounded transition ${
              summaryBtn
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
