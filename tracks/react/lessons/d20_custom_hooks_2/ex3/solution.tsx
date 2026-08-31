// d20_custom_hooks_2 / ex3 - a page number that can point at nothing.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 3".
import { useCallback, useState } from "react";

export function usePaged<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

  const next = useCallback(() => {
    setPage((current) => Math.min(current + 1, totalPages));
  }, [totalPages]);

  const prev = useCallback(() => {
    setPage((current) => Math.max(current - 1, 1));
  }, []);

  return {
    page,
    pageItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    next,
    prev,
  };
}
