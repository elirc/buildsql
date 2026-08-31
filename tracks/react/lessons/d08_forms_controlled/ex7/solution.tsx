// d08_forms_controlled / ex7 - text in, chips out.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 7".
import { useState, type KeyboardEvent } from "react";

export function TagsInput({ onChange }: { onChange: (tags: string[]) => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const next = [...tags, draft];
      setTags(next);
      onChange(next);
    }
  }

  return (
    <>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <span>{tag}</span>
          </li>
        ))}
      </ul>

      <label htmlFor="tags">Tags</label>
      <input
        id="tags"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <p role="status" />
    </>
  );
}
