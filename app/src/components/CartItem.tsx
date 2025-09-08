import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Space } from "antd";
import Meta from "antd/es/card/Meta";

import Image from "next/image";

const CartItem = () => {
  return (
    <Card size="small">
      <Flex gap={20} align="center" justify="space-evenly">
        <Image
          style={{ borderRadius: 5 }}
          src="https://picsum.photos/200/200"
          width={200}
          height={200}
          alt="Picture of the author"
        />
        <Meta title="Card title" description="This is the description" />
        <Space.Compact>
          <Button
            onClick={() => console.log("decline")}
            icon={<MinusOutlined />}
          />
          <Button
            className="pointer-events-none"
            onClick={() => console.log("random")}
          >
            10
          </Button>
          <Button
            onClick={() => console.log("increase")}
            icon={<PlusOutlined />}
          />
        </Space.Compact>
        <div key="price" className="cursor-default select-none font-bold">
          10 USD
        </div>

        <Button danger>
          <DeleteOutlined />
        </Button>
      </Flex>
    </Card>
  );
};

export default CartItem;
