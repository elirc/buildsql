// d10_effects_basics / ex8 - reference solution.
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
  }, [points, chart]);

  useEffect(() => {
    chart.setSize(size);
  }, [size, chart]);

  return <p role="status">{theme}</p>;
}
