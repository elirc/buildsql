// d22_render_performance / ex4 - a hundred rows for a screen that holds five.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 4".
import { useState } from "react";

function Row({ item, onRender }: { item: string; onRender: () => void }) {
  onRender();
  return <li>{item}</li>;
}

export function WindowedRows({
  items,
  windowSize,
  onRowRender,
}: {
  items: string[];
  windowSize: number;
  onRowRender: () => void;
}) {
  const [shown, setShown] = useState(windowSize);

  return (
    <>
      <p role="status">
        Showing {shown} of {items.length}
      </p>
      <ul>
        {items.map((item) => (
          <Row key={item} item={item} onRender={onRowRender} />
        ))}
      </ul>
      <button type="button" onClick={() => setShown((current) => current + windowSize)}>
        Show more
      </button>
    </>
  );
}
