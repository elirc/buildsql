// 01_components_jsx / ex3 - reference solution.

export function LabelledField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
