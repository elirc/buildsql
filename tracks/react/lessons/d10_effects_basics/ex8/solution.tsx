// d10_effects_basics / ex8 - one effect per thing being synchronised.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 8".
import { useEffect } from "react";

type Chart = { setData: (points: number[]) => void; setSize: (size: number) => void };

export function ChartSync({
  points,
  size,
  theme,
  chart,
}: {
  points: number[];
  size: number;
  theme: string;
  chart: Chart;
}) {
  useEffect(() => {
    chart.setData(points);
    chart.setSize(size);
  }, [points, size, theme, chart]);

  return <p role="status">{theme}</p>;
}
