// d05_events_updates / ex5 - Enter sends, Shift and Enter does not.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 5".
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
          if (event.key === "Enter") {
            onSubmit(message);
          }
        }}
      />
    </>
  );
}
