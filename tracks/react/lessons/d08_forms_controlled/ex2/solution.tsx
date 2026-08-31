// d08_forms_controlled / ex2 - three radios that know they are one question.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 2".
import { useState } from "react";

const OPTIONS = [
  { value: "standard", label: "Standard", estimate: "Arrives in 5 days" },
  { value: "express", label: "Express", estimate: "Arrives in 2 days" },
  { value: "overnight", label: "Overnight", estimate: "Arrives tomorrow" },
];

export function ShippingChoice({ onChange }: { onChange: (value: string) => void }) {
  const [chosen, setChosen] = useState(OPTIONS[0].value);

  return (
    <div aria-label="Shipping">
      {OPTIONS.map((option) => (
        <span key={option.value}>
          <input
            type="radio"
            id={option.value}
            value={option.value}
            onChange={() => {
              setChosen(option.value);
              onChange(option.value);
            }}
          />
          <label htmlFor={option.value}>{option.label}</label>
        </span>
      ))}
      <p>{OPTIONS.find((option) => option.value === chosen)?.estimate}</p>
    </div>
  );
}
