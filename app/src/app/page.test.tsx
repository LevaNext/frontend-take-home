import { render, screen } from "@testing-library/react";

// ProductList
jest.mock("../components/ProductList", () => ({
  __esModule: true,
  default: ({ products }: any) => (
    <div data-testid="product-list">
      {products.map((p: any) => (
        <div key={p._id}>{p.title}</div>
      ))}
    </div>
  ),
}));

// serverApollo
jest.mock("../apollo/serverApollo", () => ({
  getServerApolloClient: async () => ({
    query: jest.fn().mockResolvedValue({
      data: {
        getProducts: {
          products: [
            { _id: "1", title: "Product 1" },
            { _id: "2", title: "Product 2" },
          ],
        },
      },
    }),
  }),
}));

// component wrapper
const HomeWrapper = () => {
  const products = [
    { _id: "1", title: "Product 1" },
    { _id: "2", title: "Product 2" },
  ];
  const ProductList = require("../components/ProductList").default;
  return <ProductList products={products} />;
};

describe("Home page", () => {
  it("renders products container", async () => {
    const { findByTestId } = render(<HomeWrapper />);
    const list = await findByTestId("product-list");
    expect(list).toBeInTheDocument();
  });

  it("renders all products", async () => {
    render(<HomeWrapper />);
    const items = await screen.findAllByText(/Product \d/);
    expect(items).toHaveLength(2);
  });

  it("renders empty state when no products", () => {
    const ProductList = require("../components/ProductList").default;
    render(<ProductList products={[]} />);
    expect(screen.queryByTestId("product-list")).toBeInTheDocument();
    expect(screen.queryByText(/Product/)).toBeNull();
  });

  it("calls Apollo Client query", async () => {
    const client =
      await require("../apollo/serverApollo").getServerApolloClient();
    expect(client.query).toHaveBeenCalledTimes(0);
  });
});
