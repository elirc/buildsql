// d15_ref_patterns / ex1 - memory that is per-component, not per-module.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 1".

// One variable for the whole module means one variable for every gauge on the
// page - and it is what the stub currently uses.
let previous: number | null = null;

export function PressureGauge({ label, reading }: { label: string; reading: number }) {
  const was = previous;
  previous = reading;

  return (
    <p role="status">
      {label}: now {reading}, was {was === null ? "nothing yet" : was}
    </p>
  );
}
