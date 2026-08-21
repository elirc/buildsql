// 11_performance_patterns / ex1 - skipping a render that would change nothing.
// See tracks/react/lessons/11_performance_patterns/README.md, "Exercise 1".
//
// onRender() is the render-counting probe. Leave it where it is.

export function ExpensiveRow({ label, onRender }: { label: string; onRender: () => void }) {
  onRender();
  return <li>{label}</li>;
}
