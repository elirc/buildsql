// d08_forms_controlled / ex5 - reference solution.
import { useState, type ChangeEvent } from "react";

export function QuantityBox({
  onQuantityChange,
}: {
  onQuantityChange: (quantity: number | null) => void;
}) {
  const [text, setText] = useState("");

  function commit(next: string) {
    setText(next);
    onQuantityChange(next === "" ? null : Number(next));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (!/^\d*$/.test(next)) {
      return;
    }
    commit(next);
  }

  function handleBlur() {
    const typed = text === "" ? 1 : Number(text);
    commit(String(Math.min(99, Math.max(1, typed))));
  }

  return (
    <>
      <label htmlFor="quantity">Quantity</label>
      <input
        id="quantity"
        inputMode="numeric"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </>
  );
}
