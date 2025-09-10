import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky top-0 w-full shadow-md z-50 bg-white mb-2">
      <div className="container mx-auto px-4 flex justify-evenly items-center h-16">
        <Link href="/" className="outline-0">
          <h1 className="font-bold text-2xl cursor-pointer text-gray-800 hover:text-blue-600 transition">
            Shop
          </h1>
        </Link>

        <Link href="/cart" className="outline-0">
          <h1 className="font-semibold text-xl cursor-pointer text-gray-800 hover:text-blue-600 transition">
            Cart
          </h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
