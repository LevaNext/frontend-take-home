import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

export function createApolloClient(visitorToken?: string) {
  const httpLink = new HttpLink({
    uri: "https://take-home-be.onrender.com/api",
  });

  const authLink = setContext((_, { headers }) => {
    let token = visitorToken || "";
    if (typeof window !== "undefined" && !token) {
      const match = document.cookie.match(/visitorToken=([^;]+)/);
      if (match) token = match[1];
    }

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: "no-cache", errorPolicy: "ignore" },
      query: { fetchPolicy: "no-cache", errorPolicy: "all" },
    },
  });

  return client;
}
