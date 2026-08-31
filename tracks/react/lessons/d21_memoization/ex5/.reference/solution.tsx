// d21_memoization / ex5 - reference solution.
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

  // With the updater form the callback never reads `zoom`, so `zoom` is not a
  // dependency - and the function stops being rebuilt by the very thing it
  // exists to change.
  const zoomIn = useCallback(() => setZoom((current) => current + 1), []);
  const reset = useCallback(() => setZoom(1), []);

  return (
    <>
      <p role="status">Zoom: {zoom}</p>
      <ZoomControls onZoomIn={zoomIn} onReset={reset} onRender={onControlsRender} />
    </>
  );
}
