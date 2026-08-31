// d14_refs_dom / ex6 - the form node knows things no single field does.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 6".
import { useId, useRef, type FormEvent } from "react";

export type Draft = { summary: string; details: string };

export function IssueDraft({ onSend }: { onSend: (draft: Draft) => void }) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.current === null) return;
    const data = new FormData(form.current);
    onSend({
      summary: String(data.get("summary") ?? ""),
      details: String(data.get("details") ?? ""),
    });
  }

  return (
    <form ref={form} onSubmit={send}>
      <label htmlFor={`${id}-summary`}>Summary</label>
      <input id={`${id}-summary`} name="summary" />
      <label htmlFor={`${id}-details`}>Details</label>
      <textarea id={`${id}-details`} name="details" />
      <button>Send</button>
      <button onClick={() => form.current?.reset()}>Discard</button>
    </form>
  );
}
