// d01_jsx_rendering / ex1 - one line of text, assembled from two props.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 1".

export function PriceTag({ label, cents }: { label: string; cents: number }) {
  return (
    <p>
      {label}: {cents}
    </p>
  );
}
