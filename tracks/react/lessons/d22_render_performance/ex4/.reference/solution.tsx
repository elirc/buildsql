// d22_render_performance / ex4 - reference solution.
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

  // The number of rows on screen is a decision this component gets to make.
  // No amount of memoizing a row makes rendering ninety-five invisible ones
  // free, because the work is the rendering itself.
  const visible = items.slice(0, shown);

  return (
    <>
      <p role="status">
        Showing {visible.length} of {items.length}
      </p>
      <ul>
        {visible.map((item) => (
          <Row key={item} item={item} onRender={onRowRender} />
        ))}
      </ul>
      <button type="button" onClick={() => setShown((current) => current + windowSize)}>
        Show more
      </button>
    </>
  );
}
