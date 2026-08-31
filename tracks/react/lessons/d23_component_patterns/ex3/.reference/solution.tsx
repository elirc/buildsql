// d23_component_patterns / ex3 - reference solution.
import { createContext, useContext, useState, type ReactNode } from "react";

// The whole point of a compound component: the parts are written by the caller
// in whatever arrangement they like, and they find each other through a
// context rather than through props nobody wants to pass.
const TabsContext = createContext<{
  selected: string;
  select: (id: string) => void;
} | null>(null);

function useTabs() {
  const value = useContext(TabsContext);
  if (value === null) throw new Error("Tabs parts must be used inside <Tabs>");
  return value;
}

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [selected, setSelected] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ selected, select: setSelected }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

function List({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="tablist" aria-label={label}>
      {children}
    </div>
  );
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { selected, select } = useTabs();
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected === id}
      onClick={() => select(id)}
    >
      {children}
    </button>
  );
}

function Panel({ id, children }: { id: string; children: ReactNode }) {
  const { selected } = useTabs();
  // Only the panel that is showing exists at all.
  if (selected !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.List = List;
Tabs.Tab = Tab;
Tabs.Panel = Panel;
