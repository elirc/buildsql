// d17_reducers / ex8 - three states, one subscription, and a stale closure.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 8".
import { useEffect, useState } from "react";

export function MonitorPanel({
  subscribe,
}: {
  subscribe: (onAlert: (text: string) => void) => () => void;
}) {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [hidden, setHidden] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(
    () =>
      subscribe((text) => {
        if (muted) {
          setHidden(hidden + 1);
        } else {
          setAlerts([...alerts, text]);
        }
      }),
    [subscribe],
  );

  return (
    <>
      <ul>
        {alerts.map((alert, index) => (
          <li key={index}>{alert}</li>
        ))}
      </ul>
      <p role="status">{hidden} hidden while muted</p>
      <button type="button" onClick={() => setMuted((current) => !current)}>
        {muted ? "Unmute" : "Mute"}
      </button>
      <button
        type="button"
        onClick={() => {
          setAlerts([]);
          setHidden(0);
        }}
      >
        Clear
      </button>
    </>
  );
}
