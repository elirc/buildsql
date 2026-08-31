// d23_component_patterns / ex2 - reference solution.
import { useCallback, useId, useState } from "react";

// The behaviour, with nothing about questions or answers in it. Any component
// that needs "a thing that is open or closed" can call this and get its own.
export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);

  const toggle = useCallback(() => setOpen((current) => !current), []);
  const close = useCallback(() => setOpen(false), []);

  return { open, toggle, close };
}

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const id = useId();
  const { open, toggle } = useDisclosure();

  return (
    <>
      {/* aria-expanded is how a button says what it did, and it is the one
          part of this pattern people leave out. */}
      <button type="button" aria-expanded={open} aria-controls={id} onClick={toggle}>
        {question}
      </button>
      {open && <p id={id}>{answer}</p>}
    </>
  );
}
