// 01_components_jsx / challenge - two different elements from one component.
// See tracks/react/lessons/01_components_jsx/README.md, "Challenge".

export function Crumb({
  label,
  href,
  current,
}: {
  label: string;
  href: string;
  current: boolean;
}) {
  return <a href={href}>challenge: Crumb is not implemented yet</a>;
}
