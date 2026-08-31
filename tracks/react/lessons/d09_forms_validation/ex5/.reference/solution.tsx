// d09_forms_validation / ex5 - reference solution.
import { useState } from "react";

const PATTERN = /^[A-Z]{3}-\d{4}$/;

export function CouponField({ onApply }: { onApply: (code: string) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleApply() {
    const normalised = code.trim().toUpperCase();
    if (!PATTERN.test(normalised)) {
      setError("Coupon codes look like ABC-1234");
      return;
    }
    setError("");
    onApply(normalised);
  }

  return (
    <>
      <label htmlFor="coupon">Coupon code</label>
      <input
        id="coupon"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        aria-invalid={error === "" ? "false" : "true"}
        aria-describedby={error === "" ? undefined : "coupon-error"}
      />
      {error !== "" && <p id="coupon-error">{error}</p>}
      <button type="button" onClick={handleApply}>
        Apply
      </button>
    </>
  );
}
