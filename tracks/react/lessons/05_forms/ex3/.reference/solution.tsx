// 05_forms / ex3 - reference solution.
import { useState } from "react";

export function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "" });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
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
