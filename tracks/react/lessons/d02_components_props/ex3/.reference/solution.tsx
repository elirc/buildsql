// d02_components_props / ex3 - reference solution.

export function LinkButton({
  href,
  label,
  external = false,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {label}
      {external ? <span> (opens in a new tab)</span> : null}
    </a>
  );
}
