// d08_forms_controlled / ex3 - reference solution.
import { useState, type FormEvent } from "react";

export function FeedbackForm({
  onSubmit,
}: {
  onSubmit: (feedback: { category: string; message: string }) => void;
}) {
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ category, message });
  }

  return (
    <form aria-label="Feedback" onSubmit={handleSubmit}>
      <label htmlFor="category">Category</label>
      <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value="bug">Bug</option>
        <option value="idea">Idea</option>
        <option value="praise">Praise</option>
      </select>

      <label htmlFor="message">Message</label>
      <textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} />

      <button type="submit">Send feedback</button>
    </form>
  );
}
