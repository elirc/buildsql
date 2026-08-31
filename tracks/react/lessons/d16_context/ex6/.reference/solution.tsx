// d16_context / ex6 - reference solution.
import { createContext, useContext, type ReactNode } from "react";

const LevelContext = createContext(1);

export function SectionProvider({ children }: { children: ReactNode }) {
  // Read the level this section is sitting at, publish one deeper. A provider
  // is allowed to consume the same context it provides - that is how a value
  // accumulates down a tree instead of being replaced.
  const level = useContext(LevelContext);
  return <LevelContext.Provider value={Math.min(level + 1, 6)}>{children}</LevelContext.Provider>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  const level = useContext(LevelContext);
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag>{children}</Tag>;
}
