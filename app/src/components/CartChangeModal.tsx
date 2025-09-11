import { useCartStore } from "@/store/store";

export const CartChangeModal = () => {
  const { cartChanged, diff, acknowledged, acknowledgeChanges } =
    useCartStore();

  // disable scroll
  if (typeof window !== "undefined") {
    if (cartChanged && !acknowledged) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  if (!cartChanged || acknowledged) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50  bg-[rgba(0,0,0,0.7)]">
      <div className="bg-white p-6 rounded shadow-lg w-[92vw] max-w-[800px]">
        <p className="font-medium text-yellow-800 mb-3">
          🛒 Cart has been updated by the backend. Please acknowledge changes:
        </p>
        <ul className="list-disc ml-5 mb-4 text-yellow-900">
          {diff.map((d) => (
            <li key={d.productId}>
              {d.title}:{" "}
              {d.newQuantity !== undefined
                ? `Quantity reduced from ${d.oldQuantity} to ${d.newQuantity}`
                : "Out of stock"}
            </li>
          ))}
        </ul>
        <button
          className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded hover:bg-yellow-700 transition"
          onClick={acknowledgeChanges}
        >
          OK
        </button>
      </div>
    </div>
  );
};
