// d14_refs_dom / ex5 - a highlight is not a focus.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 5".
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export function CommandMenu({
  commands,
  onRun,
}: {
  commands: string[];
  onRun: (command: string) => void;
}) {
  const [active, setActive] = useState(0);
  const items = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    items.current[0]?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % commands.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + commands.length) % commands.length);
    }
  }

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {commands.map((command, index) => (
        <button
          key={command}
          type="button"
          role="menuitem"
          tabIndex={index === active ? 0 : -1}
          ref={(node) => {
            items.current[index] = node;
          }}
          onClick={() => onRun(command)}
        >
          {command}
        </button>
      ))}
    </div>
  );
}
