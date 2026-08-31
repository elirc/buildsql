// d05_events_updates / ex1 - reference solution.

export function DoorBell({ onRing }: { onRing: () => void }) {
  return (
    <button type="button" onClick={() => onRing()}>
      Ring
    </button>
  );
}
