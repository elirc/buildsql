// d16_context / ex8 - overriding one setting should not reset the others.
// See tracks/react/lessons/d16_context/README.md, "Exercise 8".
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
  const value = useMemo<Prefs>(
    () => ({ ...DEFAULTS, ...prefs }),
    [prefs.locale, prefs.density],
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
