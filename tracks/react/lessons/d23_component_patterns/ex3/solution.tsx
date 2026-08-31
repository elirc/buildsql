// d23_component_patterns / ex3 - parts that cannot see each other.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 3".
import { useState, type ReactNode } from "react";

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [selected] = useState(defaultTab);
  return <div data-selected={selected}>{children}</div>;
}

function List({ label, children }: { label: string; children: ReactNode }) {
  return <div>{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  return <button type="button">{children}</button>;
}

function Panel({ id, children }: { id: string; children: ReactNode }) {
  return <div>{children}</div>;
}

Tabs.List = List;
Tabs.Tab = Tab;
Tabs.Panel = Panel;
