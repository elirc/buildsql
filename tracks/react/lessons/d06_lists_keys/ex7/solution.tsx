// d06_lists_keys / ex7 - edit one row at a time, and replace rather than rewrite.
// See tracks/react/lessons/d06_lists_keys/README.md, "Exercise 7".
import { useState } from "react";

type Item = { id: string; text: string };

export function EditableList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function save() {
    const item = items.find((candidate) => candidate.id === editingId);
    if (item) {
      item.text = draft;
    }
    setItems([...items]);
    setEditingId(null);
  }

  return (
    <ul>
      {items.map((item) =>
        item.id === editingId ? (
          <li key={item.id}>
            <input
              aria-label="Item text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="button" onClick={save}>
              Save
            </button>
            <button type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </li>
        ) : (
          <li key={item.id}>
            <span>{item.text}</span>
            <button
              type="button"
              onClick={() => {
                setEditingId(item.id);
                setDraft(item.text);
              }}
            >
              Edit {item.text}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}
