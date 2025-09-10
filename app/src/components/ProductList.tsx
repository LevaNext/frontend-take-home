import { Product } from "@/zod/products";
import ProductCard from "./ProductCard";

const ProductList: React.FC<{ products: Product[] }> = ({ products }) => {
  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
