// d24_mixed_gauntlet / ex1 - controlled input + normalisation + derived state.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 1".
import { useId, useState } from "react";

export function VoucherBox({ onRedeem }: { onRedeem: (code: string) => void }) {
  const id = useId();
  const [typed, setTyped] = useState("");

  const ready = typed.length >= 5;

  return (
    <>
      <label htmlFor={id}>Voucher</label>
      <input id={id} value={typed} onChange={(event) => setTyped(event.target.value)} />
      <p role="status">{ready ? "Ready" : "Keep typing"}</p>
      <button type="button" disabled={!ready} onClick={() => onRedeem(typed)}>
        Redeem
      </button>
    </>
  );
}
