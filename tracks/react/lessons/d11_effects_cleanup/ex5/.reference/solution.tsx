// d11_effects_cleanup / ex5 - reference solution.
import { useEffect, useRef } from "react";

export function ClickOutside({ onOutside }: { onOutside: () => void }) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const box = boxRef.current;
      if (box && !box.contains(event.target as Node)) {
        onOutside();
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onOutside]);

  return (
    <div ref={boxRef}>
      <button type="button">Inside</button>
    </div>
  );
}
