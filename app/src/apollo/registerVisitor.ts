"use client";
import { gql } from "@apollo/client";
import { createApolloClient } from "./client";
import { z } from "zod";
import { notifyError } from "@/components/NotificationToast";

// Schema ვალიდაციისთვის
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

// Visitor-ის რეგისტრაცია ან cookie-დან ამოღება
export async function registerVisitor() {
  try {
    const existingToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitorToken="))
      ?.split("=")[1];

    if (existingToken) {
      return { token: existingToken }; // აბრუნებს მხოლოდ token-ს
    }

    const client = createApolloClient();
    const { data } = await client.mutate({ mutation: REGISTER_VISITOR });

    const parsed = registerVisitorSchema.safeParse(data);
    if (!parsed.success) {
      notifyError("Failed to register visitor: invalid response");
      throw new Error("Zod validation failed");
    }

    const visitor = parsed.data.register;

    // Cookie-ში ჩაწერა 7 დღით
    document.cookie = `visitorToken=${visitor.token}; path=/; secure; samesite=strict; max-age=604800`;

    return visitor;
  } catch (err: any) {
    console.error("Visitor registration failed:", err);
    notifyError("Failed to register visitor: network/server error");
    throw err;
  }
}
