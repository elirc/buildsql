// 01_components_jsx / ex1 - reference solution.

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}
