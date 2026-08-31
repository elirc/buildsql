// d13_race_abort / ex2 - the guard has to cover the failure path too.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 2".
import { useEffect, useState } from "react";

export function ShipmentTracker({
  trackingId,
  fetchStatus,
}: {
  trackingId: string;
  fetchStatus: (trackingId: string) => Promise<string>;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setStatus(null);
    setError(null);

    fetchStatus(trackingId)
      .then((next) => {
        if (!current) return;
        setStatus(next);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });

    return () => {
      current = false;
    };
  }, [trackingId, fetchStatus]);

  if (error !== null) {
    return <p role="alert">{error}</p>;
  }
  if (status === null) {
    return <p role="status">Checking {trackingId}</p>;
  }
  return <p>{status}</p>;
}
