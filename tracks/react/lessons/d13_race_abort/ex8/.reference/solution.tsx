// d13_race_abort / ex8 - reference solution.
import { useEffect, useRef, useState } from "react";

const METRICS = ["Traffic", "Signups", "Revenue"];

export function MetricTabs({ fetchMetric }: { fetchMetric: (metric: string) => Promise<string> }) {
  const [selected, setSelected] = useState(METRICS[0]);
  // One slot per metric instead of one slot for "the answer". A late answer
  // then has somewhere true to go, and the screen simply reads the slot the
  // user is looking at.
  const [values, setValues] = useState<Record<string, string>>({});
  const requested = useRef(new Set<string>());

  useEffect(() => {
    if (requested.current.has(selected)) return;
    requested.current.add(selected);

    fetchMetric(selected).then((next) => {
      setValues((previous) => ({ ...previous, [selected]: next }));
    });
  }, [selected, fetchMetric]);

  const shown = values[selected];

  return (
    <>
      {METRICS.map((metric) => (
        <button key={metric} type="button" onClick={() => setSelected(metric)}>
          {metric}
        </button>
      ))}
      {shown === undefined ? <p role="status">Loading {selected}</p> : <p>{shown}</p>}
    </>
  );
}
