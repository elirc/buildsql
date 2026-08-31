// d05_events_updates / ex5 - reference solution.
import { useState } from "react";

export function HotkeyBox({ onSubmit }: { onSubmit: (message: string) => void }) {
  const [message, setMessage] = useState("");

  return (
    <>
      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit(message);
            setMessage("");
            return;
          }
          if (event.key === "Escape") {
            setMessage("");
          }
        }}
      />
    </>
  );
}
