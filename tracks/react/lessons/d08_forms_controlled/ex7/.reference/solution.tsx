// d08_forms_controlled / ex7 - reference solution.
import { useState, type KeyboardEvent } from "react";

export function TagsInput({ onChange }: { onChange: (tags: string[]) => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");

  function commit(next: string[]) {
    setMessage("");
    setTags(next);
    onChange(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const tag = draft.trim();
      if (tag === "") {
        return;
      }
      if (tags.includes(tag)) {
        setMessage(`${tag} is already added`);
        return;
      }
      setDraft("");
      commit([...tags, tag]);
      return;
    }

    if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      commit(tags.slice(0, -1));
    }
  }

  return (
    <>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <span>{tag}</span>
            <button type="button" onClick={() => commit(tags.filter((other) => other !== tag))}>
              Remove {tag}
            </button>
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

      <p role="status">{message}</p>
    </>
  );
}
