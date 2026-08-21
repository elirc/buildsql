// 08_refs_dom / review1 - focus management around a dialog.
// See tracks/react/lessons/08_refs_dom/README.md, "Review".
import { useState } from "react";

export function FocusOnOpen() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      {open && (
        <div role="dialog" aria-label="Settings">
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
    </>
  );
}
