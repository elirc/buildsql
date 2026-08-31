// d12_fetching_states / ex5 - one state at a time, especially on a retry.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 5".
import { useEffect, useState } from "react";

export type Ticket = { subject: string };

export function TicketView({
  ticketId,
  load,
}: {
  ticketId: string;
  load: (ticketId: string) => Promise<Ticket>;
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    load(ticketId).then(setTicket, (reason: unknown) => {
      setError(reason instanceof Error ? reason.message : String(reason));
    });
  }, [ticketId, load, attempt]);

  if (error !== null) {
    return (
      <>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => setAttempt((n) => n + 1)}>
          Retry
        </button>
      </>
    );
  }
  if (ticket === null) {
    return <p role="status">Loading ticket {ticketId}</p>;
  }
  return <p>{ticket.subject}</p>;
}
