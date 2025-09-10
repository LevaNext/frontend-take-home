import z from "zod";

export const registerVisitorSchema = z.object({
  register: z.object({
    _id: z.string(),
    token: z.string(),
    cartId: z.string(),
  }),
});
