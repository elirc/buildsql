// d11_effects_cleanup / ex5 - a document listener with the current callback.
// See tracks/react/lessons/d11_effects_cleanup/README.md, "Exercise 5".
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
  }, []);

  return (
    <div ref={boxRef}>
      <button type="button">Inside</button>
    </div>
  );
}
