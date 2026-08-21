// 04_lists_conditional / ex3 - the empty state, and the falsy-zero trap.
// See tracks/react/lessons/04_lists_conditional/README.md, "Exercise 3".

type Message = { id: string; subject: string };

export function Inbox({
  messages,
  unreadCount,
}: {
  messages: Message[];
  unreadCount: number;
}) {
  return (
    <>
      <span>{unreadCount} unread</span>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.subject}</li>
        ))}
      </ul>
    </>
  );
}
