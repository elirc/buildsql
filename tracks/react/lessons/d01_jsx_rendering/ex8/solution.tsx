// d01_jsx_rendering / ex8 - a sortable column header, in the accessibility tree too.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 8".

export function SortHeader({
  label,
  direction,
}: {
  label: string;
  direction?: "asc" | "desc";
}) {
  return (
    <th scope="col" aria-sort={direction === "asc" ? "ascending" : "descending"}>
      <button>
        {label} {direction === "asc" ? "^" : "v"}
      </button>
    </th>
  );
}
