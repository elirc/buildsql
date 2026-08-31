// d02_components_props / ex8 - reference solution.

export function NoticeBar({
  message,
  footer = "Nothing to do",
  onDismiss,
}: {
  message: string;
  footer?: string | null;
  onDismiss?: () => void;
}) {
  return (
    <div>
      <p>{message}</p>
      {footer === null ? null : <p>{footer}</p>}
      {onDismiss === undefined ? null : (
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
