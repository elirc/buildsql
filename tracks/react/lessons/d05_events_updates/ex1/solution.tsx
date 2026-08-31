// d05_events_updates / ex1 - a handler that has already run.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 1".

export function DoorBell({ onRing }: { onRing: () => void }) {
  onRing();

  return (
    <button type="button">
      Ring
    </button>
  );
}
