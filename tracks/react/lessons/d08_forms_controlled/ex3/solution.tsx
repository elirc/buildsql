// d08_forms_controlled / ex3 - a select, a textarea and a submit that stays put.
// See tracks/react/lessons/d08_forms_controlled/README.md, "Exercise 3".
import { useState } from "react";

export function FeedbackForm({
  onSubmit,
}: {
  onSubmit: (feedback: { category: string; message: string }) => void;
}) {
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");

  return (
    <form
      onSubmit={() => {
        onSubmit({ category, message });
      }}
    >
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
