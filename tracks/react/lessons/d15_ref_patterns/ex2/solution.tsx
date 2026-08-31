// d15_ref_patterns / ex2 - an effect that has to remember what it already did.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 2".
import { useEffect } from "react";

export function ImpressionBeacon({
  slotId,
  report,
}: {
  slotId: string;
  report: (slotId: string) => void;
}) {
  useEffect(() => {
    report(slotId);
  }, [slotId, report]);

  return <p>Showing {slotId}</p>;
}
