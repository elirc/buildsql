// 09_context_reducer / challenge - context and reducer, together.
// See tracks/react/lessons/09_context_reducer/README.md, "Challenge".
import type { ReactNode } from "react";

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

export function PaletteProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function PaletteLabel() {
  return <p role="status">Palette: day</p>;
}

export function PaletteToggle() {
  return (
    <button type="button">Toggle palette</button>
  );
}
