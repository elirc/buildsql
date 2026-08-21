// 05_forms / ex1 - a controlled input.
// See tracks/react/lessons/05_forms/README.md, "Exercise 1".

export function NameField() {
  return (
    <>
      <label htmlFor="full-name">Full name</label>
      <input id="full-name" />
      <output>0 characters</output>
    </>
  );
}
