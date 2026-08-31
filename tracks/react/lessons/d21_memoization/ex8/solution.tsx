// d21_memoization / ex8 - all three tools, none of them used.
// See tracks/react/lessons/d21_memoization/README.md, "Exercise 8".
import { memo, useState } from "react";

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

  const series = buildSeries(points);
  const onSelect = (label: string) => setPicked(label);

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
