// d10_effects_basics / ex4 - reference solution.
import { useEffect } from "react";

type Filters = { status: string; sort: string };

export function FilterSync({
  filters,
  apply,
}: {
  filters: Filters;
  apply: (filters: Filters) => void;
}) {
  const { status, sort } = filters;

  useEffect(() => {
    apply({ status, sort });
  }, [status, sort, apply]);

  return (
    <p role="status">
      {status} / {sort}
    </p>
  );
}
