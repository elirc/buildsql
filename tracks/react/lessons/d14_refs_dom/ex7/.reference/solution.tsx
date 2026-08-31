// d14_refs_dom / ex7 - reference solution.
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export function ExportDialog() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const last = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) first.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    // The opener is still mounted, so this is safe here - and doing it in the
    // handler rather than an effect keeps the two halves of "open" and "close"
    // next to each other.
    opener.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    // Only the two ends need catching: everything between them tabs normally.
    if (event.shiftKey && document.activeElement === first.current) {
      event.preventDefault();
      last.current?.focus();
    } else if (!event.shiftKey && document.activeElement === last.current) {
      event.preventDefault();
      first.current?.focus();
    }
  }

  return (
    <>
      <button type="button" ref={opener} onClick={() => setOpen(true)}>
        Export
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={id} onKeyDown={handleKeyDown}>
          <h2 id={id}>Export data</h2>
          <label htmlFor={`${id}-drafts`}>Include drafts</label>
          <input id={`${id}-drafts`} type="checkbox" ref={first} />
          <button type="button">Download</button>
          <button type="button" ref={last} onClick={close}>
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
