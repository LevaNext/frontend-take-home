"use client";

import { notifyError } from "@/components/NotificationToast";
import { registerVisitorSchema } from "@/zod/visitor";
import { createApolloClient } from "./client";
import { REGISTER_VISITOR } from "./mutations";

// register a visitor or get token from cookie
export async function registerVisitor() {
  try {
    // check if token already exists in cookie
    const existingToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitorToken="))
      ?.split("=")[1];

    if (existingToken) {
      // return only the token if it exists
      return { token: existingToken };
    }

    //  No existing token → create Apollo client and call register mutation
    const client = createApolloClient();
    const { data } = await client.mutate({ mutation: REGISTER_VISITOR });

    // validate response using Zod
    const parsed = registerVisitorSchema.safeParse(data);
    if (!parsed.success) {
      notifyError("Failed to register visitor: invalid response");
      throw new Error("Zod validation failed");
    }

    const visitor = parsed.data.register;

    // store token in cookie for 7 days
    document.cookie = `visitorToken=${visitor.token}; path=/; secure; samesite=strict; max-age=604800`;

    return visitor;
  } catch (err: any) {
    console.error("Visitor registration failed:", err);
    notifyError("Failed to register visitor: network/server error");
    throw err;
  }
}
