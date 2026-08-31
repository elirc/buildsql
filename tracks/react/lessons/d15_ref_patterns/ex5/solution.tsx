// d15_ref_patterns / ex5 - state arrives too late to stop the second click.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 5".
import { useState } from "react";

export function PayoutRequest({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const [sending, setSending] = useState(false);

  function request() {
    if (sending) return;
    setSending(true);
    onSubmit().finally(() => {
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
