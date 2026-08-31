// d05_events_updates / ex2 - reference solution.

export function Keypad({ onPress }: { onPress: (key: number | "clear") => void }) {
  return (
    <>
      {[1, 2, 3].map((digit) => (
        <button key={digit} type="button" onClick={() => onPress(digit)}>
          {digit}
        </button>
      ))}
      <button type="button" onClick={() => onPress("clear")}>
        Clear
      </button>
    </>
  );
}
