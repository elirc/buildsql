// d18_context_reducer_apps / ex6 - reference solution.
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";

export type DraftStore = { load: () => string | null; save: (text: string) => void };

type DraftState = { text: string };

type DraftAction = { type: "edited"; text: string };

function draftReducer(_state: DraftState, action: DraftAction): DraftState {
  return { text: action.text };
}

const DraftContext = createContext<{
  text: string;
  dispatch: Dispatch<DraftAction>;
} | null>(null);

function useDraft() {
  const value = useContext(DraftContext);
  if (value === null) throw new Error("useDraft must be used inside a DraftProvider");
  return value;
}

export function DraftProvider({
  store,
  label,
  children,
}: {
  store: DraftStore;
  label: string;
  children: ReactNode;
}) {
  // The initialiser argument, so the store is read once on mount rather than
  // on every render of the provider.
  const [state, dispatch] = useReducer(draftReducer, store, (source) => ({
    text: source.load() ?? "",
  }));

  // An effect runs after the first render whether you want it to or not, and
  // saving the draft you have just loaded is a write nobody asked for.
  const loaded = useRef(true);
  useEffect(() => {
    if (loaded.current) {
      loaded.current = false;
      return;
    }
    store.save(state.text);
  }, [state.text, store]);

  return (
    <DraftContext.Provider value={{ text: state.text, dispatch }}>
      <p>{label}</p>
      {children}
    </DraftContext.Provider>
  );
}

export function DraftEditor() {
  const id = useId();
  const { text, dispatch } = useDraft();
  return (
    <>
      <label htmlFor={id}>Draft</label>
      <textarea
        id={id}
        value={text}
        onChange={(event) => dispatch({ type: "edited", text: event.target.value })}
      />
    </>
  );
}

export function DraftCount() {
  const { text } = useDraft();
  return <p role="status">{text.length} characters</p>;
}
