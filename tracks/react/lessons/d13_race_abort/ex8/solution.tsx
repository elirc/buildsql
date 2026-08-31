// d13_race_abort / ex8 - the answer belongs to a question, not to a moment.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 8".
import { useEffect, useState } from "react";

const METRICS = ["Traffic", "Signups", "Revenue"];

export function MetricTabs({ fetchMetric }: { fetchMetric: (metric: string) => Promise<string> }) {
  const [selected, setSelected] = useState(METRICS[0]);
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setValue(null);

    fetchMetric(selected).then((next) => {
      if (!current) return;
      setValue(next);
    });

    return () => {
      current = false;
    };
  }, [selected, fetchMetric]);

  return (
    <>
      {METRICS.map((metric) => (
        <button key={metric} type="button" onClick={() => setSelected(metric)}>
          {metric}
        </button>
      ))}
      {value === null ? <p role="status">Loading {selected}</p> : <p>{value}</p>}
    </>
  );
}
