// d21_memoization / ex4 - a derived array that is new every render.
// See tracks/react/lessons/d21_memoization/README.md, "Exercise 4".
import { memo, useId, useState } from "react";

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

  const visible = tags.filter((tag) => tag.includes(search));

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
