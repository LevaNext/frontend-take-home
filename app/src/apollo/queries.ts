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

export const ADD_ITEM = gql`
  mutation AddItem($input: AddItemArgs!) {
    addItem(input: $input) {
      _id
      items {
        product {
          _id
          title
          cost
          availableQuantity
        }
        quantity
      }
      hash
    }
  }
`;

export const REMOVE_ITEM = gql`
  mutation RemoveItem($input: RemoveItemArgs!) {
    removeItem(input: $input) {
      _id
      hash
      items {
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
