import { gql } from "@apollo/client";

export const REGISTER_VISITOR = gql`
  mutation {
    register {
      _id
      token
      cartId
    }
  }
`;

export const ADD_ITEM = gql`
  mutation AddItem($input: AddItemArgs!) {
    addItem(input: $input) {
      _id
      items {
        _id # CartItem
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

export const UPDATE_ITEM_QUANTITY = gql`
  mutation UpdateItemQuantity($input: UpdateItemQuantityArgs!) {
    updateItemQuantity(input: $input) {
      _id
      hash
      items {
        _id
        quantity
        product {
          _id
          title
          cost
          availableQuantity
          isArchived
        }
      }
    }
  }
`;
