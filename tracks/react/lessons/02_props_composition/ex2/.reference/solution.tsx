// 02_props_composition / ex2 - reference solution.

export function Rating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span role="img" aria-label={`${value} out of ${max} stars`}>
      {"★".repeat(value)}
      {"☆".repeat(max - value)}
    </span>
  );
}
