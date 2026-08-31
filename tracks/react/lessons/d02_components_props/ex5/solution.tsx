// d02_components_props / ex5 - one prop chooses the role and the wording.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 5".

export function StatusPill({ status }: { status: string }) {
  return <span role="status">{status}</span>;
}
