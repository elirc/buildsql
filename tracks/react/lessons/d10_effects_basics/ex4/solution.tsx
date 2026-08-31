// d10_effects_basics / ex4 - a dependency that changes identity every render.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 4".
import { useEffect } from "react";

type Filters = { status: string; sort: string };

export function FilterSync({
  filters,
  apply,
}: {
  filters: Filters;
  apply: (filters: Filters) => void;
}) {
  useEffect(() => {
    apply(filters);
  }, [filters, apply]);

  return (
    <p role="status">
      {filters.status} / {filters.sort}
    </p>
  );
}
