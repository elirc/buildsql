// 05_forms / review1 - a submit button that unlocks itself.
// See tracks/react/lessons/05_forms/README.md, "Review".
import { useState } from "react";

export function NewsletterForm({ onSubscribe }: { onSubscribe: (email: string) => void }) {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubscribe(email);
      }}
    >
      <label htmlFor="news-email">Email</label>
      <input id="news-email" value={email} onChange={(event) => setEmail(event.target.value)} />

      <input id="news-agree" type="checkbox" />
      <label htmlFor="news-agree">I agree to the terms</label>

      <button type="submit">Subscribe</button>
    </form>
  );
}
