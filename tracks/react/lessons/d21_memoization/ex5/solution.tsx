// d21_memoization / ex5 - a useCallback that depends on what it changes.
// See tracks/react/lessons/d21_memoization/README.md, "Exercise 5".
import { memo, useCallback, useState } from "react";

const ZoomControls = memo(function ZoomControls({
  onZoomIn,
  onReset,
  onRender,
}: {
  onZoomIn: () => void;
  onReset: () => void;
  onRender: () => void;
}) {
  onRender();
  return (
    <>
      <button type="button" onClick={onZoomIn}>
        Zoom in
      </button>
      <button type="button" onClick={onReset}>
        Reset zoom
      </button>
    </>
  );
});

export function ZoomPanel({ onControlsRender }: { onControlsRender: () => void }) {
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => setZoom(zoom + 1), [zoom]);
  const reset = useCallback(() => setZoom(1), []);

  return (
    <>
      <p role="status">Zoom: {zoom}</p>
      <ZoomControls onZoomIn={zoomIn} onReset={reset} onRender={onControlsRender} />
    </>
  );
}
