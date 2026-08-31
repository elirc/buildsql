// d08_forms_controlled / ex8 - reference solution.
import { useState, type ChangeEvent } from "react";

function group(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function CurrencyField({
  onValueChange,
}: {
  onValueChange: (value: number | null) => void;
}) {
  const [digits, setDigits] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setDigits(next);
    onValueChange(next === "" ? null : Number(next));
  }

  return (
    <>
      <label htmlFor="amount">Amount</label>
      <input id="amount" inputMode="numeric" value={group(digits)} onChange={handleChange} />
    </>
  );
}
