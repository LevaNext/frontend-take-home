import { GET_PRODUCTS } from "@/apollo/queries";
import { getServerApolloClient } from "@/apollo/serverApollo";
import ProductList from "@/components/ProductList";
import { ProductsData, productsSchema } from "@/zod/schemas";
import { z } from "zod";

export default async function Home() {
  const client = await getServerApolloClient();

  let products: ProductsData = [];

  try {
    const result = await client.query({ query: GET_PRODUCTS });

    // Validate server-side response
    const parsed = productsSchema.safeParse(result.data);
    if (!parsed.success) {
      console.error(
        "Invalid products data from server:",
        z.treeifyError(parsed.error)
      );
    } else {
      products = parsed.data.getProducts.products;
    }
  } catch (err) {
    console.error("Failed to fetch products server-side:", err);
  }

  return (
    <div className="">
      <main className="">
        <ProductList products={products} />
      </main>
    </div>
  );
}
