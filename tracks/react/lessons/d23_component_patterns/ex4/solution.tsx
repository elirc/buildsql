// d23_component_patterns / ex4 - a card nobody can name.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 4".
import type { ReactNode } from "react";

export function ProductCard({ children }: { children: ReactNode }) {
  return <article>{children}</article>;
}

function Media({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Body({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Title({ children }: { children: ReactNode }) {
  return <h3>{children}</h3>;
}

function Actions({ children }: { children: ReactNode }) {
  return <footer>{children}</footer>;
}

ProductCard.Media = Media;
ProductCard.Body = Body;
ProductCard.Title = Title;
ProductCard.Actions = Actions;
