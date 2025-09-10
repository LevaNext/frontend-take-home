"use client";

import { useCartStore } from "@/store/cartStore";
import { Product } from "@/zod/products";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const items = useCartStore((state) => state.items);

  //  Computed values
  const cartItem = items.find((i) => i.product._id === product._id);
  const quantity = cartItem?.quantity ?? 0;
  const outOfStock = product.availableQuantity === 0;

  // Handlers
  const handleAdd = () => {
    if (quantity < product.availableQuantity) addItem(product);
  };

  const handleDecrease = () => {
    if (quantity > 0) decreaseItem(product._id);
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-md 
    hover:shadow-xl transition-shadow duration-200 group border border-transparent 
    hover:border-slate-300 h-full flex flex-col"
    >
      <div className="flex flex-col flex-1 p-4 space-y-2">
        <h3 className="text-center font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
          {product.title}
        </h3>

        <p className="text-center text-gray-700  font-bold text-base">
          ${product.cost}
        </p>

        <hr className="my-2 border-gray-200 border-opacity-40 " />

        <div className="mt-auto flex flex-col items-center space-y-2">
          {outOfStock ? (
            <p className="text-red-600 font-semibold mb-0 leading-none">
              Out of stock
            </p>
          ) : quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="bg-blue-600 !text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
            >
              Add to cart
            </button>
          ) : (
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleDecrease}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
              >
                -
              </button>
              <span className="font-medium inline-block  text-lg mx-4">
                {quantity}
              </span>
              <button
                onClick={handleAdd}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                disabled={quantity >= product.availableQuantity}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
