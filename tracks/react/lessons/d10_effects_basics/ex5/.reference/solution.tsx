// d10_effects_basics / ex5 - reference solution.
import { useState } from "react";

export function PurchaseButton({
  cart,
  onPurchase,
}: {
  cart: string;
  onPurchase: (cart: string) => void;
}) {
  const [orders, setOrders] = useState(0);

  function handleClick() {
    onPurchase(cart);
    setOrders((count) => count + 1);
  }

  return (
    <>
      <button type="button" onClick={handleClick}>
        Buy
      </button>
      <p role="status">Orders: {orders}</p>
    </>
  );
}
