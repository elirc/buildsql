// d14_refs_dom / ex4 - three nodes, and the first gap is the one that matters.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 4".
import { useId, useRef, useState } from "react";

export type Checkout = { name: string; email: string; card: string };

export function CheckoutFields({ onSubmit }: { onSubmit: (values: Checkout) => void }) {
  const id = useId();
  const name = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const card = useRef<HTMLInputElement>(null);
  const [missing, setMissing] = useState<string | null>(null);

  function pay() {
    const fields = [
      { label: "Name", node: name.current },
      { label: "Email", node: email.current },
      { label: "Card", node: card.current },
    ];

    let bad = false;
    for (const field of fields) {
      if ((field.node?.value ?? "") === "") {
        bad = true;
        setMissing(field.label);
        field.node?.focus();
      }
    }
    if (bad) return;

    setMissing(null);
    onSubmit({
      name: name.current?.value ?? "",
      email: email.current?.value ?? "",
      card: card.current?.value ?? "",
    });
  }

  return (
    <>
      <label htmlFor={`${id}-name`}>Name</label>
      <input id={`${id}-name`} ref={name} />
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} ref={email} />
      <label htmlFor={`${id}-card`}>Card</label>
      <input id={`${id}-card`} ref={card} />
      {missing !== null && <p role="alert">Fill in {missing}</p>}
      <button type="button" onClick={pay}>
        Pay
      </button>
    </>
  );
}
