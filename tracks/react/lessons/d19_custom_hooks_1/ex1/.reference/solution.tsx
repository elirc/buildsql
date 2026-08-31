// d19_custom_hooks_1 / ex1 - reference solution.
import { useCallback, useState } from "react";

export function useCarousel(count: number) {
  const [index, setIndex] = useState(0);

  // The updater form means neither function has to read `index`, so the only
  // thing they depend on is `count` - and `prev` not even that.
  const next = useCallback(() => {
    setIndex((current) => Math.min(current + 1, count - 1));
  }, [count]);

  const prev = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  // Derived, not stored: two booleans that are always exactly what the index
  // says they are.
  return { index, next, prev, atStart: index === 0, atEnd: index === count - 1 };
}
