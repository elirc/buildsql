// d04_state_basics / ex1 - a number the screen has to follow.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 1".

let glasses = 0;

export function WaterTracker({ goal }: { goal: number }) {
  return (
    <>
      <p role="status">
        {glasses} of {goal} glasses
      </p>
      <button
        type="button"
        onClick={() => {
          glasses = glasses + 1;
        }}
      >
        Drink
      </button>
      <button
        type="button"
        onClick={() => {
          glasses = 0;
        }}
      >
        Reset
      </button>
    </>
  );
}
