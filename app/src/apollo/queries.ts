import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      total
      products {
        _id
        title
        cost
        availableQuantity
        isArchived
      }
    }
  }
`;

export const GET_CART = gql`
  query GetCart {
    getCart {
      _id
      hash
      items {
        _id
        cartId
        product {
          _id
          title
          cost
          availableQuantity
          isArchived
        }
        quantity
        updatedAt
        addedAt
      }
      createdAt
      updatedAt
    }
  }
`;
