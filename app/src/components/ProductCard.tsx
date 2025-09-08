"use client";
import {
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Button, Card, Space } from "antd";
import Meta from "antd/es/card/Meta";

import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  availableQuantity: number;
}

interface ProductItemProps {
  product: Product;
  inCart?: boolean;
  quantity?: number;
}

const ProductCard = ({
  product,
  inCart = false,
  quantity = 0,
}: ProductItemProps) => {
  const outOfStock = product.availableQuantity === 0;
  console.log(product);

  return (
    <Link href={`/products/${product.id}`}>
      <Card
        size="small"
        style={{ width: 300 }}
        cover={
          <img
            alt="example"
            src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
          />
        }
        actions={[
          // hide when unavailable
          ...(outOfStock
            ? [
                <div
                  key="price"
                  className="cursor-default select-none font-bold"
                >
                  10 USD
                </div>,
              ]
            : []),

          ...(outOfStock && !inCart
            ? [<ShoppingCartOutlined key="cart" style={{ fontSize: 19 }} />]
            : []),

          // Quantity controls
          ...(inCart && outOfStock
            ? [
                <Space.Compact>
                  <Button
                    disabled={quantity === 0 || !inCart}
                    onClick={() => console.log("decline")}
                    icon={<MinusOutlined />}
                  />
                  <Button
                    className="pointer-events-none"
                    onClick={() => console.log("random")}
                  >
                    {quantity}
                  </Button>
                  <Button
                    disabled={quantity >= product.availableQuantity || !inCart}
                    icon={<PlusOutlined />}
                  />
                </Space.Compact>,
              ]
            : []),

          // out of Stock
          ...(outOfStock
            ? [
                <div
                  key="out-of-stock"
                  className="text-red-700 cursor-default select-none"
                >
                  Out of Stock
                </div>,
              ]
            : []),
        ]}
      >
        <Meta title="Card title" description="This is the description" />
      </Card>
    </Link>
  );
};

export default ProductCard;
