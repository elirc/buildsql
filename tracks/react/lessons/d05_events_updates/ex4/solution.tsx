// d05_events_updates / ex4 - a click inside a click.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 4".

export function NotificationCard({
  title,
  onOpen,
  onDismiss,
}: {
  title: string;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <div role="group" aria-label="Notification" onClick={() => onOpen()}>
      <p>{title}</p>
      <button type="button" onClick={() => onDismiss()}>
        Dismiss
      </button>
    </div>
  );
}
