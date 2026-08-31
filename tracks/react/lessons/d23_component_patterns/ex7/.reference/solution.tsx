// d23_component_patterns / ex7 - reference solution.
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

  // An empty list is a state with something to say, and the caller is the one
  // who knows what. Rendering an empty <ul> says nothing to anybody.
  if (items.length === 0) return <>{empty}</>;

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <button type="button" onClick={() => setPicked(item)}>
            {/* The list owns which row is picked; the caller owns what picked
                looks like. That division only works if the answer is handed
                over at the moment the markup is asked for. */}
            {renderItem(item, item === picked)}
          </button>
        </li>
      ))}
    </ul>
  );
}
