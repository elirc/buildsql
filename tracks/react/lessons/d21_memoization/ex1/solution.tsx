// d21_memoization / ex1 - a memo defeated by an object written in the JSX.
// See tracks/react/lessons/d21_memoization/README.md, "Exercise 1".
import { memo, useState } from "react";

type Format = { currency: string; decimals: number };

const MetricTile = memo(function MetricTile({
  label,
  value,
  format,
  onRender,
}: {
  label: string;
  value: number;
  format: Format;
  onRender: () => void;
}) {
  onRender();
  return (
    <p>
      {label}: {value.toFixed(format.decimals)} {format.currency}
    </p>
  );
});

export function MetricBoard({ onTileRender }: { onTileRender: () => void }) {
  const [ticks, setTicks] = useState(0);

  return (
    <>
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
      <MetricTile
        label="Revenue"
        value={1200}
        format={{ currency: "EUR", decimals: 0 }}
        onRender={onTileRender}
      />
    </>
  );
}
