import { CartItemType } from "./cart";

export interface UpdateItemQuantityMutationResult {
  updateItemQuantity: {
    _id: string;
    hash: string;
    items: CartItemType[];
  };
}

export interface RemoveItemMutationResult {
  removeItem: {
    _id: string;
    hash: string;
    items: CartItemType[];
  };
}
