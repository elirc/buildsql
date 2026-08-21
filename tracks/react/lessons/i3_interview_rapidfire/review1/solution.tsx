// i3_interview_rapidfire / review1 - conditional rendering, and the zero.
// See tracks/react/lessons/i3_interview_rapidfire/README.md, "Review".

type Message = { id: string; subject: string };

export function NotificationBell({
  unread,
  messages,
}: {
  unread: number;
  messages: Message[];
}) {
  return (
    <>
      {unread && <span>{unread} new</span>}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.subject}</li>
        ))}
      </ul>
    </>
  );
}
