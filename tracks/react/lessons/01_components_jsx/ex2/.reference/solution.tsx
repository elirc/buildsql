// 01_components_jsx / ex2 - reference solution.

export function ProfileLink({ name, href }: { name: string; href: string }) {
  return <a href={href}>Open {name}</a>;
}
