import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      products {
        _id
        title
        cost
        availableQuantity
        isArchived
      }
      total
    }
  }
`;
