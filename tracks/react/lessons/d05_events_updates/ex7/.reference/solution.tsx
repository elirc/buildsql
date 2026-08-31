// d05_events_updates / ex7 - reference solution.
import type { MouseEvent } from "react";

export function EditorToolbar({ onCommand }: { onCommand: (command: string) => void }) {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
    const command = button?.dataset.command;
    if (command) {
      onCommand(command);
    }
  }

  return (
    <div role="toolbar" aria-label="Formatting" onClick={handleClick}>
      <button type="button" data-command="bold">
        Bold
      </button>
      <button type="button" data-command="italic">
        Italic
      </button>
      <button type="button" data-command="link">
        Link
      </button>
    </div>
  );
}
