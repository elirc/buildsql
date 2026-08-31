// d19_custom_hooks_1 / ex3 - one tally for the whole module.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 3".
import { useState } from "react";

// Written once, when the module loads - so every component that calls the hook
// below is looking at this same number.
let shared = 0;

export function useTally() {
  const [, force] = useState(0);

  function add() {
    shared += 1;
    force((current) => current + 1);
  }

  return { count: shared, add };
}
