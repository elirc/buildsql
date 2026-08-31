// d08_forms_controlled / ex2 - reference solution.
import { useState } from "react";

const OPTIONS = [
  { value: "standard", label: "Standard", estimate: "Arrives in 5 days" },
  { value: "express", label: "Express", estimate: "Arrives in 2 days" },
  { value: "overnight", label: "Overnight", estimate: "Arrives tomorrow" },
];

export function ShippingChoice({ onChange }: { onChange: (value: string) => void }) {
  const [chosen, setChosen] = useState("");
  const estimate =
    OPTIONS.find((option) => option.value === chosen)?.estimate ?? "Choose a shipping speed";

  return (
    <>
      <div role="radiogroup" aria-label="Shipping">
        {OPTIONS.map((option) => (
          <span key={option.value}>
            <input
              type="radio"
              id={option.value}
              name="shipping"
              value={option.value}
              checked={chosen === option.value}
              onChange={() => {
                setChosen(option.value);
                onChange(option.value);
              }}
            />
            <label htmlFor={option.value}>{option.label}</label>
          </span>
        ))}
      </div>
      <p role="status">{estimate}</p>
    </>
  );
}
