// d16_context / ex7 - reference solution.
import { createContext, useContext, type ReactNode } from "react";

export type SafeContext<T> = {
  Provider: (props: { value: T; children: ReactNode }) => ReactNode;
  useValue: () => T;
};

export function createSafeContext<T>(name: string): SafeContext<T> {
  // Each call makes its own channel. Nothing outside this function can reach
  // it, so the only ways in are the Provider and the hook returned below.
  const Context = createContext<T | null>(null);

  function Provider({ value, children }: { value: T; children: ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useValue(): T {
    const value = useContext(Context);
    if (value === null) {
      // `name` was captured when the context was created, which is why the
      // message can be specific without the caller repeating themselves.
      throw new Error(`This hook must be used inside a ${name}`);
    }
    return value;
  }

  return { Provider, useValue };
}
