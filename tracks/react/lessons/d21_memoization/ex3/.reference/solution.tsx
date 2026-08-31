// d21_memoization / ex3 - reference solution.
import { useMemo } from "react";

export function SlugPreview({ title, onCompute }: { title: string; onCompute: () => void }) {
  // The array is a claim about what the value is made of, not a performance
  // knob. Everything read inside the factory belongs in it - here, the title
  // and the callback.
  const slug = useMemo(() => {
    onCompute();
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }, [title, onCompute]);

  return <p role="status">{slug}</p>;
}
