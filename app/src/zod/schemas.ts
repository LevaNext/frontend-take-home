import { z } from "zod";

// 1. Product schema
export const productSchema = z.object({
  _id: z.string(),
  title: z.string(),
  cost: z.number(),
  availableQuantity: z.number().int().nonnegative(),
  isArchived: z.boolean(),
});

// 2. Products query schema
export const productsSchema = z.object({
  getProducts: z.object({
    total: z.number().int().nonnegative(),
    products: z.array(productSchema),
  }),
});

// 3. TypeScript types inferred from Zod
export type Product = z.infer<typeof productSchema>;
export type ProductsData = z.infer<
  typeof productsSchema
>["getProducts"]["products"];
