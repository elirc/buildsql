// d06_lists_keys / ex1 - reference solution.

export function RecipeSteps({ steps }: { steps: string[] }) {
  return (
    <ol>
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}
