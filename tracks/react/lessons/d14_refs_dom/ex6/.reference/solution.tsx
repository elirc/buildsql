// d14_refs_dom / ex6 - reference solution.
import { useId, useRef, type FormEvent } from "react";

export type Draft = { summary: string; details: string };

export function IssueDraft({ onSend }: { onSend: (draft: Draft) => void }) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.current === null) return;

    // One node, every named control. This is why the ref goes on the form
    // rather than on each field.
    const data = new FormData(form.current);
    onSend({
      summary: String(data.get("summary") ?? ""),
      details: String(data.get("details") ?? ""),
    });
    form.current.reset();
  }

  return (
    <form ref={form} onSubmit={send}>
      <label htmlFor={`${id}-summary`}>Summary</label>
      <input id={`${id}-summary`} name="summary" />
      <label htmlFor={`${id}-details`}>Details</label>
      <textarea id={`${id}-details`} name="details" />
      <button type="submit">Send</button>
      {/* Without type="button" this submits the form, because that is what a
          button inside a form defaults to. */}
      <button type="button" onClick={() => form.current?.reset()}>
        Discard
      </button>
    </form>
  );
}
