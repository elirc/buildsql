// d12_fetching_states / ex8 - reference solution.
import { useEffect, useState } from "react";

export type Page = { items: string[]; hasMore: boolean };

export function ActivityFeed({ fetchPage }: { fetchPage: (page: number) => Promise<Page> }) {
  const [items, setItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPage(page).then(
      (result) => {
        setItems((current) => [...current, ...result.items]);
        setHasMore(result.hasMore);
        setLoading(false);
      },
      (reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
        setLoading(false);
      },
    );
  }, [fetchPage, page, attempt]);

  return (
    <>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {error !== null ? (
        <>
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Retry
          </button>
        </>
      ) : hasMore ? (
        <button type="button" disabled={loading} onClick={() => setPage((n) => n + 1)}>
          Load more
        </button>
      ) : null}
    </>
  );
}
