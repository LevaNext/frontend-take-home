"use client";

import { gql } from "@apollo/client";
import { client } from "./client";
import { z } from "zod";
import { notifyError } from "@/components/NotificationToast";

// Zod schema
const registerVisitorSchema = z.object({
  register: z.object({
    _id: z.string(),
    token: z.string(),
    cartId: z.string(),
  }),
});

const REGISTER_VISITOR = gql`
  mutation {
    register {
      _id
      token
      cartId
    }
  }
`;

// find and return existing token
export function getVisitorTokenFromCookie(): string | null {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitorToken="))
      ?.split("=")[1] || null
  );
}

export async function registerVisitor() {
  try {
    const existingToken = getVisitorTokenFromCookie();
    if (existingToken) return { token: existingToken };

    const { data } = await client.mutate({ mutation: REGISTER_VISITOR });

    const parsed = registerVisitorSchema.safeParse(data);
    if (!parsed.success) {
      notifyError("Failed to register visitor: invalid response");
      throw new Error("Zod validation failed");
    }

    const visitor = parsed.data.register;

    // save in cookie 7 days
    document.cookie = `visitorToken=${visitor.token}; path=/; secure; samesite=strict; max-age=604800`;

    return visitor;
  } catch (err: any) {
    notifyError("Failed to register visitor: network/server error");
    throw err;
  }
}
