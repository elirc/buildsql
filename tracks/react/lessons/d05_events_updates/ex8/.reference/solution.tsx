// d05_events_updates / ex8 - reference solution.
import { useEffect, useRef } from "react";

export function TapTarget({ onSingle, onDouble }: { onSingle: () => void; onDouble: () => void }) {
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pending.current !== null) {
        clearTimeout(pending.current);
      }
    },
    [],
  );

  function handleClick() {
    if (pending.current !== null) {
      clearTimeout(pending.current);
      pending.current = null;
      onDouble();
      return;
    }

    pending.current = setTimeout(() => {
      pending.current = null;
      onSingle();
    }, 250);
  }

  return (
    <button type="button" onClick={handleClick}>
      Tap
    </button>
  );
}
