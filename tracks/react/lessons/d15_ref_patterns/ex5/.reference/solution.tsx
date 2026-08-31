// d15_ref_patterns / ex5 - reference solution.
import { useRef, useState } from "react";

export function PayoutRequest({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const [sending, setSending] = useState(false);
  // State is what the user sees; this is what the code checks. It is written
  // synchronously, so the second click of a double-click already sees it.
  const busy = useRef(false);

  function request() {
    if (busy.current) return;
    busy.current = true;
    setSending(true);

    onSubmit().finally(() => {
      busy.current = false;
      setSending(false);
    });
  }

  return (
    <>
      <p role="status">{sending ? "Sending" : "Ready"}</p>
      <button type="button" disabled={sending} onClick={request}>
        Request payout
      </button>
    </>
  );
}
