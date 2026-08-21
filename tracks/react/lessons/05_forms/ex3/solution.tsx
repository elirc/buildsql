// 05_forms / ex3 - many fields, one state object.
// See tracks/react/lessons/05_forms/README.md, "Exercise 3".
import { useState } from "react";

export function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "" });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // TODO: update only the field this event came from.
    setForm({ name: event.target.value, email: "" });
  }

  return (
    <>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" value={form.name} onChange={handleChange} />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" value={form.email} onChange={handleChange} />

      <output>
        {form.name} &lt;{form.email}&gt;
      </output>
    </>
  );
}
