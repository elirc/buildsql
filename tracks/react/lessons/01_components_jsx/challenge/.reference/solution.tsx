// 01_components_jsx / challenge - reference solution.

export function Crumb({
  label,
  href,
  current,
}: {
  label: string;
  href: string;
  current: boolean;
}) {
  if (current) {
    return <span aria-current="page">{label}</span>;
  }
  return <a href={href}>{label}</a>;
}
