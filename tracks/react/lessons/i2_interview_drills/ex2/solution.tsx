// i2_interview_drills / ex2 - "page through this API for me."
// See tracks/react/lessons/i2_interview_drills/README.md, "Drill 2".
import { useState } from "react";

type Page = { items: string[]; total: number };

export function PagedList({
  fetchPage,
  pageSize,
}: {
  fetchPage: (page: number) => Promise<Page>;
  pageSize: number;
}) {
  const [page] = useState(1);

  return (
    <>
      <ul />
      <p role="status">Page {page} of 1</p>
      <button type="button">Previous</button>
      <button type="button">Next</button>
    </>
  );
}
