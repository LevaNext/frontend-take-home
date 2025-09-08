"use client";

import { ApolloProvider } from "@apollo/client/react";
import { ReactNode, useEffect, useState } from "react";
import { client } from "../apollo/client";
import {
  registerVisitor,
  getVisitorTokenFromCookie,
} from "../apollo/registerVisitor";

export default function ApolloWrapper({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initVisitor() {
      try {
        await registerVisitor();
      } finally {
        setLoading(false);
      }
    }
    initVisitor();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
