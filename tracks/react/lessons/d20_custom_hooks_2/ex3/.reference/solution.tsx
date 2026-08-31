// d20_custom_hooks_2 / ex3 - reference solution.
import { useCallback, useState } from "react";

export function usePaged<T>(items: T[], pageSize: number) {
  // What the reader asked for, which is not always a page that exists.
  const [wanted, setWanted] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // What they get. Clamping during render means the shown page is correct in
  // the very first render after the list shrinks - an effect that corrected it
  // afterwards would commit one frame of an empty page first.
  const page = Math.min(wanted, totalPages);

  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

  // Both moves start from the page that is *shown*, not from the one that was
  // asked for - otherwise walking back from a clamped page spends a step
  // undoing a move the reader never saw happen.
  const next = useCallback(() => {
    setWanted((current) => Math.min(Math.min(current, totalPages) + 1, totalPages));
  }, [totalPages]);

  const prev = useCallback(() => {
    setWanted((current) => Math.max(Math.min(current, totalPages) - 1, 1));
  }, [totalPages]);

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
