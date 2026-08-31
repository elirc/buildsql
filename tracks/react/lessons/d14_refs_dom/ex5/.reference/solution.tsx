// d14_refs_dom / ex5 - reference solution.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export function CommandMenu({
  commands,
  onRun,
}: {
  commands: string[];
  onRun: (command: string) => void;
}) {
  const [active, setActive] = useState(0);
  // One ref holding every node, filled in by a callback ref. The array index
  // is the same index the keyboard arithmetic works in.
  const items = useRef<Array<HTMLButtonElement | null>>([]);

  // The state says which entry is current; this is what makes the browser
  // agree. Keyed on `active`, so it also fires for the very first render.
  useEffect(() => {
    items.current[active]?.focus();
  }, [active]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = commands.length - 1;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index === last ? 0 : index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index === 0 ? last : index - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(last);
    }
  }

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {commands.map((command, index) => (
        <button
          key={command}
          type="button"
          role="menuitem"
          // Roving tabindex: exactly one entry is in the tab order, and the
          // arrow keys move which one it is.
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
