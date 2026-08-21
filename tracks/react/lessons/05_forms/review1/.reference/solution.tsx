// 05_forms / review1 - reference solution.
import { useState } from "react";

export function NewsletterForm({ onSubscribe }: { onSubscribe: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const ready = email.trim() !== "" && agreed;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubscribe(email);
      }}
    >
      <label htmlFor="news-email">Email</label>
      <input id="news-email" value={email} onChange={(event) => setEmail(event.target.value)} />

      <input
        id="news-agree"
        type="checkbox"
        checked={agreed}
        onChange={(event) => setAgreed(event.target.checked)}
      />
      <label htmlFor="news-agree">I agree to the terms</label>

      <button type="submit" disabled={!ready}>
        Subscribe
      </button>
    </form>
  );
}
