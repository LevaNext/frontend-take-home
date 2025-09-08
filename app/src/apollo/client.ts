import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({ uri: "https://take-home-be.onrender.com/api" });

const authLink = new SetContextLink((prevContext) => {
  let token = "";
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/visitorToken=([^;]+)/);
    if (match) token = match[1];
  }
  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
