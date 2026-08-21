// 04_lists_conditional / ex3 - reference solution.

type Message = { id: string; subject: string };

export function Inbox({
  messages,
  unreadCount,
}: {
  messages: Message[];
  unreadCount: number;
}) {
  if (messages.length === 0) {
    return <p>No messages</p>;
  }

  return (
    <>
      {unreadCount > 0 && <span>{unreadCount} unread</span>}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.subject}</li>
        ))}
      </ul>
    </>
  );
}
