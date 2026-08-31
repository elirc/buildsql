// d20_custom_hooks_2 / ex1 - a listener registered once, with the first handler.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 1".
import { useEffect } from "react";

export function useKeyPress(key: string, handler: () => void) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === key) handler();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
