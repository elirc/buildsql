// d16_context / ex6 - a level that has to know the level above it.
// See tracks/react/lessons/d16_context/README.md, "Exercise 6".
import { createContext, useContext, type ReactNode } from "react";

const LevelContext = createContext(1);

export function SectionProvider({ children }: { children: ReactNode }) {
  return <LevelContext.Provider value={2}>{children}</LevelContext.Provider>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  const level = useContext(LevelContext);
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag>{children}</Tag>;
}
