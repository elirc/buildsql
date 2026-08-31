// d15_ref_patterns / ex7 - reference solution.
import { useEffect, useRef, useState } from "react";

export type Session = { id: string; close: () => void };

export function AnalyticsSession({
  label,
  createSession,
}: {
  label: string;
  createSession: () => Session;
}) {
  const session = useRef<Session | null>(null);
  // The documented way to initialise a ref lazily: check, then fill. Passing
  // createSession() as the argument would call it on every render and discard
  // every result but the first.
  if (session.current === null) {
    session.current = createSession();
  }
  const [events, setEvents] = useState(0);

  useEffect(() => {
    const opened = session.current;
    return () => {
      opened?.close();
    };
  }, []);

  return (
    <>
      <p>{label}</p>
      <p role="status">
        Session {session.current.id}, Events: {events}
      </p>
      <button type="button" onClick={() => setEvents((current) => current + 1)}>
        Bump
      </button>
    </>
  );
}
