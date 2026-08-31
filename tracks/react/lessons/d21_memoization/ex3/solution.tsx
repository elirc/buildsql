// d21_memoization / ex3 - a dependency array that makes the answer wrong.
// See tracks/react/lessons/d21_memoization/README.md, "Exercise 3".
import { useMemo } from "react";

export function SlugPreview({ title, onCompute }: { title: string; onCompute: () => void }) {
  const slug = useMemo(() => {
    onCompute();
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  return <p role="status">{slug}</p>;
}
