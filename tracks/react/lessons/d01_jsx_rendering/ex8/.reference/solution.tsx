// d01_jsx_rendering / ex8 - reference solution.

export function SortHeader({
  label,
  direction,
}: {
  label: string;
  direction?: "asc" | "desc";
}) {
  const sort =
    direction === "asc" ? "ascending" : direction === "desc" ? "descending" : undefined;
  const arrow = direction === "asc" ? "^" : direction === "desc" ? "v" : null;

  return (
    <th scope="col" aria-sort={sort}>
      <button type="button">
        {label}
        {arrow === null ? null : <span aria-hidden="true">{arrow}</span>}
      </button>
    </th>
  );
}
