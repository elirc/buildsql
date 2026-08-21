// i2_interview_drills / ex2 - reference solution.
import { useEffect, useState } from "react";

type Page = { items: string[]; total: number };

export function PagedList({
  fetchPage,
  pageSize,
}: {
  fetchPage: (page: number) => Promise<Page>;
  pageSize: number;
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);

  useEffect(() => {
    let current = true;

    fetchPage(page).then((result) => {
      if (current) {
        setData(result);
      }
    });

    return () => {
      current = false;
    };
  }, [page, fetchPage]);

  const pageCount = data === null ? 1 : Math.max(1, Math.ceil(data.total / pageSize));

  return (
    <>
      <ul>
        {(data?.items ?? []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p role="status">
        Page {page} of {pageCount}
      </p>
      <button type="button" disabled={page === 1} onClick={() => setPage((n) => n - 1)}>
        Previous
      </button>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => setPage((n) => n + 1)}
      >
        Next
      </button>
    </>
  );
}
