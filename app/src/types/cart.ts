export interface Product {
  _id: string;
  title: string;
  cost: number;
  availableQuantity: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  cartId: string;
  product: Product;
  quantity: number;
  addedAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  hash: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Define TypeScript type
type CartItemType = {
  _id: string;
  cartId: string;
  product: {
    _id: string;
    title: string;
    cost: number;
    availableQuantity: number;
    isArchived: boolean;
  };
  quantity: number;
  updatedAt: string;
  addedAt: string;
};

type CartType = {
  _id: string;
  hash: string;
  items: CartItemType[];
  createdAt: string;
  updatedAt: string;
};

// Query result type
export type GetCartQueryResult = {
  getCart: CartType;
};
