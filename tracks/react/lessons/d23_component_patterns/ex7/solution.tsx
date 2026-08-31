// d23_component_patterns / ex7 - a list that keeps its state to itself.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 7".
import { useState, type ReactNode } from "react";

export function PickerList({
  items,
  renderItem,
  empty,
}: {
  items: string[];
  renderItem: (item: string, picked: boolean) => ReactNode;
  empty?: ReactNode;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <button type="button" onClick={() => setPicked(item)}>
            {renderItem(item, false)}
          </button>
        </li>
      ))}
    </ul>
  );
}
