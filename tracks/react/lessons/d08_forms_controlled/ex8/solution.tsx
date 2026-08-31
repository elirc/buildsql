// d08_forms_controlled / ex8 - a masked field: pretty on screen, plain to the parent.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 8".
import { useState } from "react";

export function CurrencyField({
  onValueChange,
}: {
  onValueChange: (value: number | null) => void;
}) {
  const [amount, setAmount] = useState("");

  return (
    <>
      <label htmlFor="amount">Amount</label>
      <input
        id="amount"
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value);
          onValueChange(Number(event.target.value));
        }}
      />
    </>
  );
}
