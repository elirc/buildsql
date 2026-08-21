// i2_interview_drills / ex6 - "a confirm dialog. Mind the keyboard."
// See tracks/react/lessons/i2_interview_drills/README.md, "Drill 6".
import { useId, useState } from "react";

export function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <h2 id={titleId}>Delete item?</h2>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Confirm
          </button>
        </div>
      )}
    </>
  );
}
