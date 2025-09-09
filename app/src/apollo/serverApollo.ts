import { cookies } from "next/headers";
import { createApolloClient } from "@/apollo/client";

export async function getServerApolloClient() {
  const visitorToken = (await cookies()).get("visitorToken")?.value;
  return createApolloClient(visitorToken);
}
