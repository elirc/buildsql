// d03_children_composition / ex6 - reference solution.
import { useCallback, useState, type ReactNode } from "react";

export type TogglerState = { on: boolean; toggle: () => void };

export function Toggler({ children }: { children: (state: TogglerState) => ReactNode }) {
  const [on, setOn] = useState(false);
  const toggle = useCallback(() => setOn((current) => !current), []);

  return <>{children({ on, toggle })}</>;
}
