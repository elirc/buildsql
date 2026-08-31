// d04_state_basics / ex8 - reference solution.
import { useState } from "react";

export function TitleDraft({ noteId, initialTitle }: { noteId: string; initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [shownNoteId, setShownNoteId] = useState(noteId);

  if (noteId !== shownNoteId) {
    setShownNoteId(noteId);
    setTitle(initialTitle);
  }

  return (
    <>
      <label htmlFor="note-title">Title</label>
      <input id="note-title" value={title} onChange={(event) => setTitle(event.target.value)} />
    </>
  );
}
