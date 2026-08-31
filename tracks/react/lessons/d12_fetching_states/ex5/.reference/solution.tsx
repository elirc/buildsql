// d12_fetching_states / ex5 - reference solution.
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
    setTicket(null);
    setError(null);
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
