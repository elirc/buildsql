// d21_memoization / ex4 - reference solution.
import { memo, useId, useMemo, useState } from "react";

const VisibleTags = memo(function VisibleTags({
  tags,
  onRender,
}: {
  tags: string[];
  onRender: () => void;
}) {
  onRender();
  return (
    <ul>
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
});

export function TagPanel({ tags, onTagsRender }: { tags: string[]; onTagsRender: () => void }) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [ticks, setTicks] = useState(0);

  // Not about speed - filtering four strings costs nothing. This is useMemo's
  // other job: `filter` returns a new array every time it runs, and a new
  // array is a changed prop however identical its contents.
  const visible = useMemo(() => tags.filter((tag) => tag.includes(search)), [tags, search]);

  return (
    <>
      <label htmlFor={id}>Search</label>
      <input id={id} value={search} onChange={(event) => setSearch(event.target.value)} />
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
      <VisibleTags tags={visible} onRender={onTagsRender} />
    </>
  );
}
