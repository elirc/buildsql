// d12_fetching_states / ex8 - paging that adds, and survives a bad page.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 8".
import { useEffect, useState } from "react";

export type Page = { items: string[]; hasMore: boolean };

export function ActivityFeed({ fetchPage }: { fetchPage: (page: number) => Promise<Page> }) {
  const [items, setItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPage(page).then(
      (result) => {
        setItems(result.items);
        setHasMore(result.hasMore);
        setLoading(false);
      },
      (reason: unknown) => {
        setItems([]);
        setError(reason instanceof Error ? reason.message : String(reason));
        setLoading(false);
      },
    );
  }, [fetchPage, page]);

  return (
    <>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {error !== null ? <p role="alert">{error}</p> : null}
      {hasMore ? (
        <button type="button" disabled={loading} onClick={() => setPage((n) => n + 1)}>
          Load more
        </button>
      ) : null}
    </>
  );
}
