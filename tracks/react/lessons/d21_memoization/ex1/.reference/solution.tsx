// d21_memoization / ex1 - reference solution.
import { memo, useState } from "react";

type Format = { currency: string; decimals: number };

// Outside the component, so it is created once when the module loads and is
// the same object for every render of everything. Nothing about it depends on
// props or state, so there is nothing for useMemo to key on either.
const EUROS: Format = { currency: "EUR", decimals: 0 };

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
      <MetricTile label="Revenue" value={1200} format={EUROS} onRender={onTileRender} />
    </>
  );
}
