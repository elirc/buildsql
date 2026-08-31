// d05_events_updates / ex7 - one listener for a whole toolbar.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 7".

export function EditorToolbar({ onCommand }: { onCommand: (command: string) => void }) {
  return (
    <div role="toolbar" aria-label="Formatting" onClick={() => onCommand("bold")}>
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
