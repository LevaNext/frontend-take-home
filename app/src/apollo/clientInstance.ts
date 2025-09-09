import { createApolloClient } from "./client";

// client-side
export const apolloClient = createApolloClient(
  typeof window !== "undefined"
    ? localStorage.getItem("visitorToken") ?? ""
    : ""
);
