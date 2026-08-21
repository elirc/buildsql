// i3_interview_rapidfire / review1 - reference solution.

type Message = { id: string; subject: string };

export function NotificationBell({
  unread,
  messages,
}: {
  unread: number;
  messages: Message[];
}) {
  if (messages.length === 0) {
    return <p>You are all caught up</p>;
  }

  return (
    <>
      {unread > 0 && <span>{unread} new</span>}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.subject}</li>
        ))}
      </ul>
    </>
  );
}
