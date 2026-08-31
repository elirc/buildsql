// d15_ref_patterns / ex2 - reference solution.
import { useEffect, useRef } from "react";

export function ImpressionBeacon({
  slotId,
  report,
}: {
  slotId: string;
  report: (slotId: string) => void;
}) {
  // What has already been reported is not something anybody looks at, so it is
  // not state - and if it were state it would land in the array below and the
  // effect would chase its own tail.
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (seen.current.has(slotId)) return;
    seen.current.add(slotId);
    report(slotId);
  }, [slotId, report]);

  return <p>Showing {slotId}</p>;
}
