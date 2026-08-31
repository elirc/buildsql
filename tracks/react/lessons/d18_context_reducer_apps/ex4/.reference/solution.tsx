// d18_context_reducer_apps / ex4 - reference solution.
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

type SelectionState = { selected: string[] };

type SelectionAction =
  | { type: "toggled"; id: string }
  | { type: "selectedAll"; ids: string[] }
  | { type: "cleared" };

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case "toggled":
      return state.selected.includes(action.id)
        ? { selected: state.selected.filter((id) => id !== action.id) }
        : { selected: [...state.selected, action.id] };
    case "selectedAll":
      return { selected: [...action.ids] };
    case "cleared":
      return { selected: [] };
  }
}

const SelectionContext = createContext<{
  ids: string[];
  selected: string[];
  dispatch: Dispatch<SelectionAction>;
} | null>(null);

function useSelection() {
  const value = useContext(SelectionContext);
  if (value === null) throw new Error("useSelection must be used inside a SelectionProvider");
  return value;
}

export function SelectionProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  const [state, dispatch] = useReducer(selectionReducer, { selected: [] });
  return (
    <SelectionContext.Provider value={{ ids, selected: state.selected, dispatch }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function SelectAllBox() {
  const id = useId();
  const box = useRef<HTMLInputElement>(null);
  const { ids, selected, dispatch } = useSelection();

  const all = ids.length > 0 && selected.length === ids.length;
  const some = selected.length > 0 && !all;

  // `indeterminate` is a property of the DOM node, not an attribute, so there
  // is no JSX for it - which is what the ref is for.
  useEffect(() => {
    if (box.current !== null) box.current.indeterminate = some;
  }, [some]);

  return (
    <>
      <label htmlFor={id}>All</label>
      <input
        id={id}
        type="checkbox"
        ref={box}
        checked={all}
        // Half-selected behaves like not-selected: clicking it finishes the job
        // rather than throwing away what is already chosen.
        onChange={() => dispatch(all ? { type: "cleared" } : { type: "selectedAll", ids })}
      />
    </>
  );
}

export function RowBox({ id: rowId }: { id: string }) {
  const id = useId();
  const { selected, dispatch } = useSelection();
  return (
    <>
      <label htmlFor={id}>{rowId}</label>
      <input
        id={id}
        type="checkbox"
        checked={selected.includes(rowId)}
        onChange={() => dispatch({ type: "toggled", id: rowId })}
      />
    </>
  );
}
