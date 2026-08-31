// d24_mixed_gauntlet / ex8 - a compound component + a context + focus.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 8".
import { Children, isValidElement, useState, type ReactNode } from "react";

export function Wizard({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const all = Children.toArray(children);

  return (
    <div>
      {all}
      <button type="button" onClick={() => setIndex((current) => current + 1)}>
        Move on
      </button>
    </div>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Nav() {
  return (
    <>
      <p role="status">Step 1 of 1</p>
      <button type="button">Back</button>
      <button type="button">Next</button>
    </>
  );
}

Wizard.Step = Step;
Wizard.Nav = Nav;
