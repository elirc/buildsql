// d04_state_basics / ex8 - a draft that has to start over when the note does.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 8".
import { useState } from "react";

export function TitleDraft({ noteId, initialTitle }: { noteId: string; initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);

  return (
    <>
      <label htmlFor="note-title">Title</label>
      <input
        id="note-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
    </>
  );
}
