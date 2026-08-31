// d07_conditional_ui / ex3 - rendering nothing is a thing a component can do.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 3".

export function MaintenanceBanner({ notice }: { notice: string | null }) {
  return <div>{notice}</div>;
}
