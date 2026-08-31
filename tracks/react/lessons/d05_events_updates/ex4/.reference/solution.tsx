// d05_events_updates / ex4 - reference solution.

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
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDismiss();
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
