// d21_memoization / ex8 - reference solution.
import { memo, useCallback, useMemo, useState } from "react";

const Legend = memo(function Legend({
  series,
  onSelect,
  onRender,
}: {
  series: string[];
  onSelect: (label: string) => void;
  onRender: () => void;
}) {
  onRender();
  return (
    <ul>
      {series.map((label) => (
        <li key={label}>
          <button type="button" onClick={() => onSelect(label)}>
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
});

export function ChartPanel({
  points,
  buildSeries,
  onLegendRender,
}: {
  points: number[];
  buildSeries: (points: number[]) => string[];
  onLegendRender: () => void;
}) {
  const [theme, setTheme] = useState("light");
  const [picked, setPicked] = useState<string | null>(null);

  // The expensive part, and the identity the memoized legend compares against
  // - one useMemo doing both jobs at once.
  const series = useMemo(() => buildSeries(points), [points, buildSeries]);

  // Nothing to read, so nothing to depend on.
  const onSelect = useCallback((label: string) => setPicked(label), []);

  return (
    <>
      <p role="status">Theme: {theme}</p>
      <button
        type="button"
        onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
      >
        Switch theme
      </button>
      {picked !== null && <p>Picked: {picked}</p>}
      <Legend series={series} onSelect={onSelect} onRender={onLegendRender} />
    </>
  );
}
