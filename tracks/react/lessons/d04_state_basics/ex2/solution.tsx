// d04_state_basics / ex2 - one boolean, two things that follow from it.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 2".

export function Spoiler({ text }: { text: string }) {
  return (
    <>
      <button type="button">Show spoiler</button>
      <p>{text}</p>
    </>
  );
}
