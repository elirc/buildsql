// d16_context / ex7 - the three pieces, packaged once.
// See tracks/react/lessons/d16_context/README.md, "Exercise 7".
import { createContext, useContext, type ReactNode } from "react";

export type SafeContext<T> = {
  Provider: (props: { value: T; children: ReactNode }) => ReactNode;
  useValue: () => T;
};

export function createSafeContext<T>(name: string): SafeContext<T> {
  const Context = createContext<T | null>(null);

  function Provider({ value, children }: { value: T; children: ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useValue(): T {
    return useContext(Context) as T;
  }

  return { Provider, useValue };
}
