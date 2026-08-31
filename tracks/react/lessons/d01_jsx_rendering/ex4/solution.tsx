// d01_jsx_rendering / ex4 - the same number, said twice: in text and in ARIA.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 4".

export function ProgressMeter({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) {
  const percent = (done / total) * 100;

  return (
    <div aria-label={label}>
      {percent}% ({done} of {total})
    </div>
  );
}
