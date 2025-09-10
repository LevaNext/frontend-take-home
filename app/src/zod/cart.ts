import { z } from "zod";

// Zod schema for a single cart item
export const cartItemSchema = z.object({
  _id: z.string(), // backend CartItem ID
  product: z.object({
    _id: z.string(),
    title: z.string(),
    cost: z.number(),
    availableQuantity: z.number(),
  }),
  quantity: z.number().min(1),
});

// Zod schema for the full cart response
export const cartSchema = z.object({
  _id: z.string(),
  hash: z.string(),
  items: z.array(cartItemSchema),
});

export const getCartSchema = z.object({
  getCart: z.object({
    _id: z.string(),
    hash: z.string(),
    items: z.array(cartItemSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});
