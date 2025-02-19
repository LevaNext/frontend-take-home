# Frontend Developer Take Home

## Table of Contents
1. [Overview](#overview)  
2. [Objective](#objective)  
3. [Key Requirements](#key-requirements)  
4. [Important Details](#important-details)  
5. [Data Models & Zod Schemas](#data-models-and-zod-schemas)  
6. [Implementation Guidelines](#implementation-guidelines)  
7. [Handling Real-Time Updates](#handling-real-time-updates)  
8. [User Acknowledgment Flow](#user-acknowledgment-flow)  
9. [Submission Guidelines](#submission-guidelines)  
10. [Evaluation Criteria](#evaluation-criteria)

---

**Please send all test subsmissions and questions to submissions@proxied.com.**

## 1. Overview
This challenge assesses your ability to build a **Next.js** frontend application that manages a shopping cart’s **real-time** data updates using **GraphQL** and **Apollo Client**. You will integrate with an existing backend that periodically changes product availability (every 5 minutes) and notifies clients about these changes. The goal is to ensure users are always informed about — and agree to — any cart modifications before proceeding.

**GraphQL endpoint:** `https://take-home-be.onrender.com/api`

### Tech Stack
- **Next.js** (Framework)
- **Apollo Client** (GraphQL)
- **Zod** (Client-side data validation) (recommended)
- **TypeScript**
- **ESLint & Prettier** (Code quality and style)

---

## 2. Objective
1. Add, Remove products and update item quantity through the UI.
2. Display and manage a cart in real-time.
3. Notify users when changes occur to their cart items:
   - **Item goes out of stock** (`ITEM_OUT_OF_STOCK`)
   - **Item quantity is reduced** (`ITEM_QUANTITY_UPDATED`)
4. Prompt users to acknowledge and accept these changes before proceeding.
5. Show mastery of:
   - **Next.js** routing and SSR/CSR patterns.
   - **Apollo Client** (queries, mutations, subscriptions).
   - **Best practices** in code organization and style.
   - **Performant** real-time or polling approaches.
   - **Token-based** authentication for API requests.

---

## 3. Key Requirements

1. **Real-Time Updates**  
   - Implement **GraphQL Subscriptions** or **polling** to detect changes in cart items.  
   - Subscriptions are preferred, with bonus points for using them.

2. **User Notification Mechanism**  
   - Whenever the cart is updated by the backend, show a **prompt** or **banner** telling the user:  
     - Which item(s) changed?  
     - What changed (out of stock or reduced quantity)?  
   - Require the user to **acknowledge** before continuing.

3. **Cart Hash Management**  
   - The backend updates a **cart hash** whenever cart items change.  
   - Use this hash to determine if a cart has changed since last fetch.  
   - If using polling, only fetch the entire cart if the hash changes, to minimize network usage.

4. **Validation**  
   - All input to mutations (add, remove, update cart items) must pass validations before sending to the API.

5. **Authentication**  
   - Implement **Next.js middleware** to attach the visitor token (provided by the backend) to GraphQL requests.  
   - Ensure no API request is sent without valid authentication.

---

## 4. Important Details

### Product Availability Shuffle (Every 5 Minutes)
- The backend runs a process that changes product availability randomly.
- If `availableQuantity` becomes **0**:
  - All cart items for that product are **removed** from the cart.
  - A `ITEM_OUT_OF_STOCK` event is published over GraphQL subscriptions (or can be detected if you poll).
- If a cart item’s quantity is **more** than the updated `availableQuantity`:
  - The cart item’s quantity is **reduced** to match the new availability.
  - A `ITEM_QUANTITY_UPDATED` event is published.
- When these changes occur, the backend updates the cart’s `hash` to reflect the new state (for polling).

### Cart Items & Products
 - If a product is added through the `addItem` mutation the cart's `hash` will be updated to reflect the new state (for polling).
 - If a product is removed through the `removeItem` mutation the cart's `hash` will be updated to reflect the new state (for polling).
 - If a cart item quantity is **UPDATED** through the `updateItemQuantity` mutation the cart's `hash` will *NOT* be updated.

### GraphQL Schema
Here is a summary of relevant parts of the schema:

```graphql
 type Cart {
    _id: ID!
    hash: String!
    items: [CartItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    _id: ID!
    cartId: ID!
    product: Product!
    quantity: Int!
    updatedAt: String!
    addedAt: String!
  }

  type Product {
    _id: ID!
    title: String!
    cost: Float!
    availableQuantity: Int!
    isArchived: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Visitor {
    _id: ID!
    token: String!
    cartId: ID!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input AddItemArgs {
    productId: ID!
    quantity: Int!
  }

  input RemoveItemArgs {
    cartItemId: ID!
  }

  input UpdateItemQuantityArgs {
    cartItemId: ID!
    quantity: Int!
  }

  enum CartItemEvent {
    ITEM_QUANTITY_UPDATED
    ITEM_OUT_OF_STOCK
  }

  type CartItemMessage {
    event: CartItemEvent!
    payload: CartItem!
  }

  type Mutation {
    register: Visitor!
    addItem(input: AddItemArgs!): Cart!
    removeItem(input: RemoveItemArgs!): Cart!
    updateItemQuantity(input: UpdateItemQuantityArgs!): Cart!
  }

  type GetProductsData {
    products: [Product!]!
    total: Int!
  }

  type Query {
    getCart: Cart!
    getProducts: GetProductsData!
  }

  type Subscription {
    cartItemUpdate: CartItemMessage!
  }
```

---

## 5. Data Models & Zod Schemas
### Zod Cart Schemas

```ts
import { z } from "zod";
import validator from "validator";

export const cartAddItemSchema = z.object({
  productId: z
    .string()
    .refine((input) => validator.isMongoId(input), "Invalid product ID"),
  quantity: z.number().min(1),
});

export const cartRemoveItemSchema = z.object({
  cartItemId: z
    .string()
    .refine((input) => validator.isMongoId(input), "Invalid cart item ID"),
});

export const cartUpdateItemQuantitySchema = z.object({
  cartItemId: z
    .string()
    .refine((input) => validator.isMongoId(input), "Invalid cart item ID"),
  quantity: z.number().min(1),
});
```
You can use these schemas on the client side before making GraphQL mutations to ensure data integrity.

---

## 6. Implementation Guidelines

1. **Project Setup**
  - Create a new Next.js project (`npx create-next-app@latest [project-name] [options]` [link](https://nextjs.org/docs/pages/api-reference/cli/create-next-app))
  - Configure ESLint, Prettier, and TypeScript (optional but encouraged).
2. **Apollo Client**
  - Integrate Apollo Client for GraphQL queries, mutations, and subscriptions (or polling).
  - Provide a global ApolloProvider to your Next.js application (client side).
3. **Next.js Middleware**
  - Capture and store the visitor token from the backend.
  - Attach it as an Authorization header in all GraphQL requests (Bearer {token}).
4. **Cart State Management**
  - Store the cart data (including the hash) in a global state a React context or State management of your choice.
  - On application load, fetch the cart and store it.
5. **Coding Best Practices**
  - Maintain a clean commit history.
  - Follow recommended Next.js and React patterns.
  - Use ESLint and Prettier to ensure consistent code style.

## 7. Handling Real-Time Updates

### Option A: GraphQL Subscriptions (Preferred)
  - Subscribe to cartItemUpdate events.
  - When receiving an event (ITEM_QUANTITY_UPDATED, ITEM_OUT_OF_STOCK), compare it with the current cart state.
  - Fetch or partially update the affected cart item(s).
  - Use `connectionParams` to pass the `authToken`, ensuring authenticated access
    ```json
    {
       "connectionParams": {
          "authToken": <TOKEN>
          }
    }
    ```
    
### Option B: Polling
  - Periodically check for cart hash changes using a minimal query.
  - If the hash changes, fetch the updated cart.
  - This approach is less efficient than subscriptions but is acceptable.

***Important: When a cart item changes, prompt the user to acknowledge the new cart state. If the user does not acknowledge, they should not be allowed to proceed to checkout.***

---

## 8. User Acknowledgment Flow
 1. Backend triggers event when a product’s quantity changes or product goes out of stock.
 2. Frontend receives the updated data (via subscription or by detecting a hash mismatch with polling).
 3. User sees a notification or a modal summarizing:
  - Item(s) with changed quantities.
  - Item(s) removed due to being out of stock.
  - User must accept the updated cart state before continuing.
  - This can be a simple “OK” button.

---

## 9. Submission Guidelines
 1. GitHub Repository
  - Fork or create a repo with your Next.js application.
  - Use meaningful commit messages.
 2. Pull Request
  - Provide a detailed description of the functionalities you implemented.
  - Explain your approach to handling real-time data (subscription or polling).
 3. Code Style & Quality
  - Pass ESLint checks.
  - Use Prettier for code formatting.
  - If you have automated tests, include instructions for running them (optional but bonus).

---

## 10. Evaluation Criteria - (of evaluation importance not scored)
 1. **Functionality (40%)**
  - Does the application accurately display and update cart data in real-time (or polled)?
  - Are user notifications correct and timely?
 2. **Code Quality & Best Practices (30%)**
  - Is the code organized, readable, and maintainable?
  - Are Next.js, Apollo Client, and React best practices followed?
 3. **Performance & Optimization (20%)**
  - Efficiently handle subscription messages or polling checks.
  - Minimize unnecessary network requests.
 4. **User Experience (10%)**
  - Is the app intuitive and responsive?
  - Is the acknowledgment flow seamless for the end-user?
