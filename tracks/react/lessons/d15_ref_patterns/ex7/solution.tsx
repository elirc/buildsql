// d15_ref_patterns / ex7 - useRef(expensive()) is not lazy.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 7".
import { useRef, useState } from "react";

export type Session = { id: string; close: () => void };

export function AnalyticsSession({
  label,
  createSession,
}: {
  label: string;
  createSession: () => Session;
}) {
  const session = useRef(createSession()).current;
  const [events, setEvents] = useState(0);

  return (
    <>
      <p>{label}</p>
      <p role="status">
        Session {session.id}, Events: {events}
      </p>
      <button type="button" onClick={() => setEvents((current) => current + 1)}>
        Bump
      </button>
    </>
  );
}
