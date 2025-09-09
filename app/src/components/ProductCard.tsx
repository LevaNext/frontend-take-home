"use client";

import { useCartStore } from "@/store/cartStore";
import { Product } from "@/zod/schemas";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const items = useCartStore((state) => state.items);

  const cartItem = items.find((i) => i.product._id === product._id);
  const quantity = cartItem?.quantity ?? 0;

  const outOfStock = product.availableQuantity === 0;

  const handleAdd = () => {
    if (quantity < product.availableQuantity) {
      addItem(product);
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) decreaseItem(product._id);
  };

  return (
    <div className="border rounded-lg shadow p-4 flex flex-col items-center space-y-3">
      <h3 className="font-semibold text-lg text-center">{product.title}</h3>
      <p className="text-gray-700 font-bold">{product.cost}$</p>

      {outOfStock ? (
        <p className="text-red-600 font-semibold">Out of stock</p>
      ) : (
        <>
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add to cart
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDecrease}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
              >
                -
              </button>
              <span className="font-medium">{quantity}</span>
              <button
                onClick={handleAdd}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                disabled={quantity >= product.availableQuantity}
              >
                +
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductCard;
