import { Product } from "@/zod/product";

export interface CartItemType {
  _id: string; // backend CartItem ID
  product: Product;
  quantity: number;
}

export interface AddItemMutationResult {
  addItem: {
    _id: string; // Cart ID
    hash: string;
    items: CartItemType[];
  };
}

// State for the cart store
export interface CartState {
  hasToken: boolean; // true if token exists in cookie
  items: CartItemType[];
  cartHash?: string;

  // Actions
  setHasToken: (value: boolean) => void;
  addItem: (product: Product) => Promise<void>;
  decreaseItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
}
