// d23_component_patterns / ex2 - a hook that describes behaviour without holding it.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 2".
import { useId, useState } from "react";

export function useDisclosure(initial = false) {
  return {
    open: initial,
    toggle: () => undefined,
    close: () => undefined,
  };
}

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {question}
      </button>
      {open && <p id={id}>{answer}</p>}
    </>
  );
}
