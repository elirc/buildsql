// d19_custom_hooks_1 / ex1 - a hook that hands out new functions every render.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 1".
import { useState } from "react";

export function useCarousel(count: number) {
  const [index, setIndex] = useState(0);

  function next() {
    setIndex((current) => Math.min(current + 1, count - 1));
  }

  function prev() {
    setIndex((current) => Math.max(current - 1, 0));
  }

  return { index, next, prev, atStart: index === 0, atEnd: index === count - 1 };
}
