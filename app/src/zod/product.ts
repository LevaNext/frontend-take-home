import { z } from "zod";

export const productSchema = z.object({
  _id: z.string(),
  title: z.string(),
  cost: z.number(),
  availableQuantity: z.number().int().nonnegative(),
  isArchived: z.boolean().optional(),
});

export const productsSchema = z.object({
  getProducts: z.object({
    total: z.number().int().nonnegative(),
    products: z.array(productSchema),
  }),
});

export type Product = z.infer<typeof productSchema>;
export type ProductsData = z.infer<
  typeof productsSchema
>["getProducts"]["products"];
