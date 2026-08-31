// d02_components_props / ex4 - reference solution.

export function Stepper({
  value,
  step = 1,
  min,
  max,
  onChange,
}: {
  value: number;
  step?: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <>
      <button type="button" disabled={value <= min} onClick={() => onChange(value - step)}>
        Decrease
      </button>
      <output>{value}</output>
      <button type="button" disabled={value >= max} onClick={() => onChange(value + step)}>
        Increase
      </button>
    </>
  );
}
