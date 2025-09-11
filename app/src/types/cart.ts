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

export interface DiffItem {
  productId: string;
  title: string;
  oldQuantity: number;
  newQuantity?: number; // undefined if out of stock
}

// State for the cart store
export interface CartState {
  hasToken: boolean; // true if token exists in cookie
  items: CartItemType[];
  cartHash?: string;
  cartChanged: boolean;
  diff: DiffItem[];
  acknowledged: boolean;

  // Actions
  setHasToken: (value: boolean) => void;
  setDiff: (diff: DiffItem[]) => void;
  setCartChanged: (val: boolean) => void;
  acknowledgeChanges: () => void;
  addItem: (product: Product) => Promise<void>;
  decreaseItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  setItems: (payload: { items: CartItemType[]; cartHash?: string }) => void;
  syncWithBackend: (backendItems: CartItemType[], backendHash?: string) => void;
  clearCart: () => void;
}
