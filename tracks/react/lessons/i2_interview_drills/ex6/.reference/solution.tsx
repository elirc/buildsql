// i2_interview_drills / ex6 - reference solution.
import { useEffect, useId, useRef, useState } from "react";

export function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  useEffect(() => {
    if (open) {
      cancel.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button type="button" ref={trigger} onClick={() => setOpen(true)}>
        Delete
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <h2 id={titleId}>Delete item?</h2>
          <button type="button" ref={cancel} onClick={close}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              close();
            }}
          >
            Confirm
          </button>
        </div>
      )}
    </>
  );
}
