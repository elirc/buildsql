// d14_refs_dom / ex7 - a dialog the keyboard can walk out of is not modal.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 7".
import { useEffect, useId, useRef, useState } from "react";

export function ExportDialog() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const last = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) first.current?.focus();
  }, [open]);

  return (
    <>
      <button type="button" ref={opener} onClick={() => setOpen(true)}>
        Export
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={id}>
          <h2 id={id}>Export data</h2>
          <label htmlFor={`${id}-drafts`}>Include drafts</label>
          <input id={`${id}-drafts`} type="checkbox" ref={first} />
          <button type="button">Download</button>
          <button type="button" ref={last} onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
