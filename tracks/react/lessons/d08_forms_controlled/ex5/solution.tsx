// d08_forms_controlled / ex5 - an empty box is a state, not an error.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 5".
import { useState } from "react";

export function QuantityBox({
  onQuantityChange,
}: {
  onQuantityChange: (quantity: number | null) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <label htmlFor="quantity">Quantity</label>
      <input
        id="quantity"
        value={quantity}
        onChange={(event) => {
          const next = Number(event.target.value);
          setQuantity(next);
          onQuantityChange(next);
        }}
      />
    </>
  );
}
