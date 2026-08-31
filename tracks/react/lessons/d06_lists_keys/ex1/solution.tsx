// d06_lists_keys / ex1 - one array in, one list out.
// See tracks/react/lessons/d06_lists_keys/README.md, "Exercise 1".

export function RecipeSteps({ steps }: { steps: string[] }) {
  return (
    <ul>
      {steps.map((step) => (
        <li>{step}</li>
      ))}
    </ul>
  );
}
