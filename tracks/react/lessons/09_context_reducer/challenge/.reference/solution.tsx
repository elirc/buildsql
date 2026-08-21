// 09_context_reducer / challenge - reference solution.
import { createContext, useContext, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";

export type Palette = "day" | "night";
export type PaletteAction = { type: "toggled" };

export function paletteReducer(state: Palette, action: PaletteAction): Palette {
  switch (action.type) {
    case "toggled":
      return state === "day" ? "night" : "day";
    default:
      return state;
  }
}

type PaletteValue = { palette: Palette; dispatch: Dispatch<PaletteAction> };

const PaletteContext = createContext<PaletteValue | null>(null);

export function usePalette(): PaletteValue {
  const value = useContext(PaletteContext);
  if (value === null) {
    throw new Error("usePalette must be used inside a PaletteProvider");
  }
  return value;
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, dispatch] = useReducer(paletteReducer, "day");
  const value = useMemo(() => ({ palette, dispatch }), [palette]);

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function PaletteLabel() {
  const { palette } = usePalette();
  return <p role="status">Palette: {palette}</p>;
}

export function PaletteToggle() {
  const { dispatch } = usePalette();
  return (
    <button type="button" onClick={() => dispatch({ type: "toggled" })}>
      Toggle palette
    </button>
  );
}
