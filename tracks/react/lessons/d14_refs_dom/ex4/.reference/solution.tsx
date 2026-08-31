// d14_refs_dom / ex4 - reference solution.
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

    // `find` stops at the first match, which is exactly the rule: report and
    // focus the first gap, then leave.
    const gap = fields.find((field) => (field.node?.value ?? "") === "");
    if (gap !== undefined) {
      setMissing(gap.label);
      gap.node?.focus();
      return;
    }

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
