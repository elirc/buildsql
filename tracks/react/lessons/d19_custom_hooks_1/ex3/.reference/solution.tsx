// d19_custom_hooks_1 / ex3 - reference solution.
import { useCallback, useState } from "react";

export function useTally() {
  // The hook has no storage of its own. This line is a recipe: every component
  // that runs it gets its own useState slot, with its own value.
  const [count, setCount] = useState(0);

  const add = useCallback(() => {
    setCount((current) => current + 1);
  }, []);

  return { count, add };
}
