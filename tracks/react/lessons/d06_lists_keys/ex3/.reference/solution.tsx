// d06_lists_keys / ex3 - reference solution.

export function Mentions({
  messages,
  me,
}: {
  messages: { id: string; text: string }[];
  me: string;
}) {
  const mine = messages.filter((message) => message.text.includes(`@${me}`));

  if (mine.length === 0) {
    return <p>No mentions yet</p>;
  }

  return (
    <ul>
      {mine.map((message) => (
        <li key={message.id}>{message.text}</li>
      ))}
    </ul>
  );
}
