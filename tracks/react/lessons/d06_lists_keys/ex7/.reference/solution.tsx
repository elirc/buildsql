// d06_lists_keys / ex7 - reference solution.
import { useState } from "react";

type Item = { id: string; text: string };

export function EditableList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function save() {
    setItems(items.map((item) => (item.id === editingId ? { ...item, text: draft } : item)));
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
