"use client";

import { ReactNode, useEffect, useState } from "react";
import { createApolloClient } from "@/apollo/client";
import { registerVisitor } from "@/apollo/registerVisitor";
import { useCartStore, VisitorType } from "@/store/cartStore";
import { z } from "zod";
import { ApolloProvider } from "@apollo/client/react";
import { gql } from "@apollo/client";

// GraphQL query to fetch cart info
const GET_CART = gql`
  query {
    getCart {
      _id
      hash
      items {
        _id
        product {
          _id
          title
          cost
          availableQuantity
        }
        quantity
      }
    }
  }
`;

// Zod schema for cart validation
const cartSchema = z.object({
  getCart: z.object({
    _id: z.string(),
    hash: z.string(),
    items: z.array(
      z.object({
        _id: z.string(),
        product: z.object({
          _id: z.string(),
          title: z.string(),
          cost: z.number(),
          availableQuantity: z.number(),
        }),
        quantity: z.number(),
      })
    ),
  }),
});

export default function ApolloWrapper({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<any>(null);
  const setVisitor = useCartStore((state) => state.setVisitor);

  useEffect(() => {
    async function init() {
      try {
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("visitorToken="))
          ?.split("=")[1];

        let visitor: VisitorType;

        if (!cookieToken) {
          // 1️⃣ Cookie არ არის → რეგისტრაცია
          const registeredVisitor = await registerVisitor();

          if (
            !("_id" in registeredVisitor) ||
            !("cartId" in registeredVisitor)
          ) {
            throw new Error("Registered visitor missing _id or cartId");
          }

          visitor = {
            _id: registeredVisitor._id,
            cartId: registeredVisitor.cartId,
            token: registeredVisitor.token,
          };

          // Cookie-ში მხოლოდ token
          document.cookie = `visitorToken=${visitor.token}; path=/; secure; samesite=strict; max-age=604800`;
        } else {
          // 2️⃣ Cookie token არის → ავიღოთ cartId backend-დან
          const tempClient = createApolloClient(cookieToken);
          const { data } = await tempClient.query({ query: GET_CART });

          const parsed = cartSchema.safeParse(data);
          if (!parsed.success) {
            console.error(
              "Invalid cart data from server:",
              z.treeifyError(parsed.error)
            );
            throw new Error("Invalid cart data from server");
          }

          visitor = {
            _id: parsed.data.getCart._id,
            cartId: parsed.data.getCart._id,
            token: cookieToken,
          };
        }

        // 3️⃣ Visitor-ის set Zustand-ში
        setVisitor(visitor);

        // 4️⃣ ApolloClient შექმნა
        setClient(createApolloClient(visitor.token));
      } catch (err) {
        console.error("ApolloWrapper init failed:", err);
      }
    }

    init();
  }, [setVisitor]);

  if (!client) return <div>Loading...</div>;

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
