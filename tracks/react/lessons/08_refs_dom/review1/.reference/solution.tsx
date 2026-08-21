// 08_refs_dom / review1 - reference solution.
import { useEffect, useRef, useState } from "react";

export function FocusOnOpen() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closer.current?.focus();
    }
  }, [open]);

  function close() {
    setOpen(false);
    opener.current?.focus();
  }

  return (
    <>
      <button type="button" ref={opener} onClick={() => setOpen(true)}>
        Open
      </button>
      {open && (
        <div role="dialog" aria-label="Settings">
          <button type="button" ref={closer} onClick={close}>
            Close
          </button>
        </div>
      )}
    </>
  );
}
