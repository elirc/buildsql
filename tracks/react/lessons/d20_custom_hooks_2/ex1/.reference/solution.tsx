// d20_custom_hooks_2 / ex1 - reference solution.
import { useEffect, useRef } from "react";

export function useKeyPress(key: string, handler: () => void) {
  // The newest handler, kept somewhere React does not compare. The listener
  // reads it at the moment the key is pressed rather than closing over the one
  // that existed when it was registered.
  const latest = useRef(handler);

  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === key) latest.current();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // Only the key. Putting `handler` here would tear the listener down and
    // put it back on every render of every component using this hook.
  }, [key]);
}
