// d05_events_updates / ex2 - one handler, four buttons, no idea which.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 2".

export function Keypad({ onPress }: { onPress: (key: number | "clear") => void }) {
  function handlePress() {
    onPress(1);
  }

  return (
    <>
      <button type="button" onClick={handlePress}>
        1
      </button>
      <button type="button" onClick={handlePress}>
        2
      </button>
      <button type="button" onClick={handlePress}>
        3
      </button>
      <button type="button" onClick={handlePress}>
        Clear
      </button>
    </>
  );
}
