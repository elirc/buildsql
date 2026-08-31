// d09_forms_validation / ex4 - the error summary, and where the keyboard goes next.
// See tracks/react/lessons/d09_forms_validation/README.md, "Exercise 4".
import { useState, type FormEvent } from "react";

type Fields = { name: string; email: string; guests: string };

export function BookingForm({
  onSubmit,
}: {
  onSubmit: (booking: { name: string; email: string; guests: number }) => void;
}) {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", guests: "" });
  const [messages, setMessages] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: string[] = [];
    if (fields.name.trim() === "") found.push("Name is required");
    if (!fields.email.includes("@")) found.push("Enter a valid email address");
    const guests = Number(fields.guests);
    if (fields.guests === "" || guests < 1 || guests > 8) {
      found.push("Guests must be between 1 and 8");
    }
    setMessages(found);
    if (found.length === 0) {
      onSubmit({ name: fields.name.trim(), email: fields.email.trim(), guests });
    }
  }

  function set(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit}>
      {messages.length > 0 && (
        <div>
          <ul>
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <label htmlFor="name">Name</label>
      <input id="name" value={fields.name} onChange={(e) => set("name", e.target.value)} />

      <label htmlFor="email">Email</label>
      <input id="email" value={fields.email} onChange={(e) => set("email", e.target.value)} />

      <label htmlFor="guests">Guests</label>
      <input id="guests" value={fields.guests} onChange={(e) => set("guests", e.target.value)} />

      <button type="submit">Book</button>
    </form>
  );
}
