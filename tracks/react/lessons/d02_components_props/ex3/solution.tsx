// d02_components_props / ex3 - a boolean prop that changes three things.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 3".

export function LinkButton({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}
