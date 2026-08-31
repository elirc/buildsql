// d10_effects_basics / ex2 - save on a change, and only on a change.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 2".
import { useEffect, useState } from "react";

export function SavedIndicator({
  value,
  save,
}: {
  value: string;
  save: (value: string) => void;
}) {
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    save(value);
    setSaved(value);
  }, [value, save]);

  return <p role="status">{saved === null ? "Nothing saved yet" : `Saved ${saved}`}</p>;
}
