// d06_lists_keys / ex3 - filter first, then decide whether there is a list at all.
// See tracks/react/lessons/d06_lists_keys/README.md, "Exercise 3".

export function Mentions({
  messages,
  me,
}: {
  messages: { id: string; text: string }[];
  me: string;
}) {
  return (
    <ul>
      {messages.map((message) => (
        <li key={message.id}>{message.text}</li>
      ))}
    </ul>
  );
}
