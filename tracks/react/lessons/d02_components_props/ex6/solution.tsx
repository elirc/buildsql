// d02_components_props / ex6 - arithmetic derived from three props.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 6".

export function PageInfo({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const first = (page - 1) * pageSize + 1;
  const last = page * pageSize;

  return (
    <p>
      Showing {first}-{last} of {total}
    </p>
  );
}
