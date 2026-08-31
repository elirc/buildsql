// d09_forms_validation / ex4 - reference solution.
import { useRef, useState, type FormEvent } from "react";

type Fields = { name: string; email: string; guests: string };
type Errors = Partial<Record<keyof Fields, string>>;

const ORDER: (keyof Fields)[] = ["name", "email", "guests"];

export function BookingForm({
  onSubmit,
}: {
  onSubmit: (booking: { name: string; email: string; guests: number }) => void;
}) {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", guests: "" });
  const [errors, setErrors] = useState<Errors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const guestsRef = useRef<HTMLInputElement>(null);
  const refs = { name: nameRef, email: emailRef, guests: guestsRef };

  function validate(): Errors {
    const found: Errors = {};
    if (fields.name.trim() === "") {
      found.name = "Name is required";
    }
    if (!fields.email.includes("@")) {
      found.email = "Enter a valid email address";
    }
    const guests = Number(fields.guests);
    if (fields.guests === "" || Number.isNaN(guests) || guests < 1 || guests > 8) {
      found.guests = "Guests must be between 1 and 8";
    }
    return found;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    const first = ORDER.find((key) => found[key] !== undefined);
    if (first !== undefined) {
      refs[first].current?.focus();
      return;
    }

    onSubmit({
      name: fields.name.trim(),
      email: fields.email.trim(),
      guests: Number(fields.guests),
    });
  }

  function set(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  const broken = ORDER.filter((key) => errors[key] !== undefined);

  return (
    <form onSubmit={handleSubmit}>
      {broken.length > 0 && (
        <div role="alert">
          <ul>
            {broken.map((key) => (
              <li key={key}>{errors[key]}</li>
            ))}
          </ul>
        </div>
      )}

      <label htmlFor="name">Name</label>
      <input
        id="name"
        ref={nameRef}
        value={fields.name}
        onChange={(event) => set("name", event.target.value)}
        aria-invalid={errors.name === undefined ? "false" : "true"}
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        ref={emailRef}
        value={fields.email}
        onChange={(event) => set("email", event.target.value)}
        aria-invalid={errors.email === undefined ? "false" : "true"}
      />

      <label htmlFor="guests">Guests</label>
      <input
        id="guests"
        ref={guestsRef}
        value={fields.guests}
        onChange={(event) => set("guests", event.target.value)}
        aria-invalid={errors.guests === undefined ? "false" : "true"}
      />

      <button type="submit">Book</button>
    </form>
  );
}
