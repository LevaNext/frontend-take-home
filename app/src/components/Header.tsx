import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky top-0 w-full shadow-md z-50 bg-gray-300 mb-5">
      <div className="container mx-auto px-4 flex justify-center gap-30 items-center h-16">
        <Link href="/" className="outline-0">
          <h1 className="font-bold text-xl cursor-pointer text-black">Shop</h1>
        </Link>

        <Link href="/cart" className="outline-0">
          <h1 className="font-bold text-xl cursor-pointer text-black">Cart</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
