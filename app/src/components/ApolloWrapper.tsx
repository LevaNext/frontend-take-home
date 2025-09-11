"use client";

import { ReactNode, useEffect, useState } from "react";
import { createApolloClient } from "@/apollo/client";
import { registerVisitor } from "@/apollo/registerVisitor";
import { ApolloProvider } from "@apollo/client/react";
import { useCartStore } from "@/store/store";

export default function ApolloWrapper({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<any>(null);
  const setHasToken = useCartStore.getState().setHasToken;

  useEffect(() => {
    async function init() {
      try {
        // Get visitor token from cookie
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("visitorToken="))
          ?.split("=")[1];

        let token: string;

        if (!cookieToken) {
          // New visitor → register with backend
          const registeredVisitor = await registerVisitor();
          if (!("token" in registeredVisitor)) {
            throw new Error("Registered visitor missing token");
          }
          token = registeredVisitor.token;

          // Store token in cookie
          document.cookie = `visitorToken=${token}; path=/; secure; samesite=strict; max-age=604800`;
        } else {
          // Existing visitor → use token from cookie
          token = cookieToken;
        }

        // Zustand store: hasToken = true if token exists
        setHasToken(!!token);

        // Initialize ApolloClient with the token
        setClient(createApolloClient(token));
      } catch (err) {
        console.error("ApolloWrapper init failed:", err);
      }
    }

    init();
  }, [setHasToken]);

  if (!client)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
