// 07_data_fetching / challenge - paging through a resource.
// See tracks/react/lessons/07_data_fetching/README.md, "Challenge".
import { useState } from "react";

type Page = { items: string[]; hasMore: boolean };

export function PaginatedList({ fetchPage }: { fetchPage: (page: number) => Promise<Page> }) {
  const [page] = useState(1);

  return (
    <>
      <ul />
      <button type="button">Previous</button>
      <button type="button">Next</button>
    </>
  );
}
