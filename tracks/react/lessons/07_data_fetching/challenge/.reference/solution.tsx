// 07_data_fetching / challenge - reference solution.
import { useEffect, useState } from "react";

type Page = { items: string[]; hasMore: boolean };

export function PaginatedList({ fetchPage }: { fetchPage: (page: number) => Promise<Page> }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true);

    fetchPage(page).then((result) => {
      if (!current) {
        return;
      }
      setData(result);
      setLoading(false);
    });

    return () => {
      current = false;
    };
  }, [page, fetchPage]);

  return (
    <>
      {loading && <p role="status">Loading</p>}
      <ul>
        {(data?.items ?? []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button type="button" disabled={page === 1} onClick={() => setPage((n) => n - 1)}>
        Previous
      </button>
      <button
        type="button"
        disabled={data === null || !data.hasMore}
        onClick={() => setPage((n) => n + 1)}
      >
        Next
      </button>
    </>
  );
}
