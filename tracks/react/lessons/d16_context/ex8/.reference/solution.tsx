// d16_context / ex8 - reference solution.
import { createContext, useContext, useMemo, type ReactNode } from "react";

export type Prefs = { locale: string; density: string };

const DEFAULTS: Prefs = { locale: "en", density: "cosy" };

const PrefsContext = createContext<Prefs>(DEFAULTS);

export function PrefsProvider({
  prefs,
  children,
}: {
  prefs: Partial<Prefs>;
  children: ReactNode;
}) {
  // What this provider is replacing. At the top of the tree that is DEFAULTS,
  // because that is what the context was created with; deeper down it is
  // whatever the providers above decided.
  const outer = useContext(PrefsContext);

  const value = useMemo<Prefs>(
    () => ({ ...outer, ...prefs }),
    [outer, prefs.locale, prefs.density],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function PrefsReadout() {
  const { locale, density } = useContext(PrefsContext);
  return (
    <p role="status">
      {locale} / {density}
    </p>
  );
}
