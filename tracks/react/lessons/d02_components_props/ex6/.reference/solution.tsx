// d02_components_props / ex6 - reference solution.

export function PageInfo({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  if (total === 0) {
    return <p>No results</p>;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <p>
      Showing {first}-{last} of {total}
    </p>
  );
}
