// d23_component_patterns / ex4 - reference solution.
import { createContext, useContext, useId, type ReactNode } from "react";

// The card generates an id and the title takes it. Nothing about that is
// visible to the caller, which is the whole reason to build it this way.
const CardContext = createContext<string | null>(null);

export function ProductCard({ children }: { children: ReactNode }) {
  const titleId = useId();
  return (
    <CardContext.Provider value={titleId}>
      {/* The name of this article is whatever the title inside it says. */}
      <article aria-labelledby={titleId}>{children}</article>
    </CardContext.Provider>
  );
}

function Media({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Body({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Title({ children }: { children: ReactNode }) {
  const titleId = useContext(CardContext);
  if (titleId === null) throw new Error("ProductCard.Title must be used inside <ProductCard>");
  return <h3 id={titleId}>{children}</h3>;
}

function Actions({ children }: { children: ReactNode }) {
  return <footer>{children}</footer>;
}

ProductCard.Media = Media;
ProductCard.Body = Body;
ProductCard.Title = Title;
ProductCard.Actions = Actions;
