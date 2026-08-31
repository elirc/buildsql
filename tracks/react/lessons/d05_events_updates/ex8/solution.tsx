// d05_events_updates / ex8 - one tap, or the first half of two.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 8".

export function TapTarget({ onSingle, onDouble }: { onSingle: () => void; onDouble: () => void }) {
  function handleClick() {
    setTimeout(() => {
      onSingle();
    }, 250);
  }

  return (
    <button type="button" onClick={handleClick}>
      Tap
    </button>
  );
}
