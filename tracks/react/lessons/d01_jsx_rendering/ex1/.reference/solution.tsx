// d01_jsx_rendering / ex1 - reference solution.

export function PriceTag({ label, cents }: { label: string; cents: number }) {
  return (
    <p>
      {label} - ${(cents / 100).toFixed(2)}
    </p>
  );
}
