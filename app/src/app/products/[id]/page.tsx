import ProductDetail from "@/components/ProductDetail";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  // TODO add product by id

  return <ProductDetail />;
}
