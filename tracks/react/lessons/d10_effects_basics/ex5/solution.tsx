// d10_effects_basics / ex5 - this was never an effect.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 5".
import { useEffect, useState } from "react";

export function PurchaseButton({
  cart,
  onPurchase,
}: {
  cart: string;
  onPurchase: (cart: string) => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      onPurchase(cart);
    }
  }, [submitted, cart, onPurchase]);

  return (
    <>
      <button type="button" onClick={() => setSubmitted(true)}>
        Buy
      </button>
      <p role="status">Orders: {submitted ? 1 : 0}</p>
    </>
  );
}
