// d10_effects_basics / ex2 - reference solution.
import { useEffect, useRef, useState } from "react";

export function SavedIndicator({
  value,
  save,
}: {
  value: string;
  save: (value: string) => void;
}) {
  const [saved, setSaved] = useState<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    save(value);
    setSaved(value);
  }, [value, save]);

  return <p role="status">{saved === null ? "Nothing saved yet" : `Saved ${saved}`}</p>;
}
