// d24_mixed_gauntlet / ex1 - reference solution.
import { useId, useState } from "react";

export function VoucherBox({ onRedeem }: { onRedeem: (code: string) => void }) {
  const id = useId();
  // What the user typed, unchanged - rewriting it under their cursor is the
  // fastest way to make a controlled input feel broken.
  const [typed, setTyped] = useState("");

  // What the code actually is. Derived during render, so it can never be out
  // of step with the box, and computed once for everything that needs it.
  const code = typed.trim().toUpperCase();
  const ready = code.length >= 5;

  return (
    <>
      <label htmlFor={id}>Voucher</label>
      <input id={id} value={typed} onChange={(event) => setTyped(event.target.value)} />
      <p role="status">{ready ? "Ready" : "Keep typing"}</p>
      <button type="button" disabled={!ready} onClick={() => onRedeem(code)}>
        Redeem
      </button>
    </>
  );
}
