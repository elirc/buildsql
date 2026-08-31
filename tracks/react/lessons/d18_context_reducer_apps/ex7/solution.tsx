// d18_context_reducer_apps / ex7 - buttons that are always offered.
// See tracks/react/lessons/d18_context_reducer_apps/README.md, "Exercise 7".
import {
  createContext,
  useContext,
  useId,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";

type NotesState = { past: string[][]; present: string[]; future: string[][] };

type NotesAction = { type: "added"; note: string } | { type: "undo" } | { type: "redo" };

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case "added":
      return {
        past: [...state.past, state.present],
        present: [...state.present, action.note],
        future: state.future,
      };
    case "undo":
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      };
    case "redo": {
      const [next, ...rest] = state.future;
      return { past: [...state.past, state.present], present: next, future: rest };
    }
  }
}

const NotesContext = createContext<{
  notes: string[];
  canUndo: boolean;
  canRedo: boolean;
  dispatch: Dispatch<NotesAction>;
} | null>(null);

function useNotes() {
  const value = useContext(NotesContext);
  if (value === null) throw new Error("useNotes must be used inside a NotesProvider");
  return value;
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, { past: [], present: [], future: [] });

  return (
    <NotesContext.Provider
      value={{ notes: state.present, canUndo: true, canRedo: true, dispatch }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function NotesEditor() {
  const id = useId();
  const { notes, dispatch } = useNotes();
  const [draft, setDraft] = useState("");

  return (
    <>
      <label htmlFor={id}>New note</label>
      <input id={id} value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "added", note: draft });
          setDraft("");
        }}
      >
        Add
      </button>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </>
  );
}

export function HistoryBar() {
  const { canUndo, canRedo, dispatch } = useNotes();
  return (
    <>
      <button type="button" disabled={!canUndo} onClick={() => dispatch({ type: "undo" })}>
        Undo
      </button>
      <button type="button" disabled={!canRedo} onClick={() => dispatch({ type: "redo" })}>
        Redo
      </button>
    </>
  );
}
