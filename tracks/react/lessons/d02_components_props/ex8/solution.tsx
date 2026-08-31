// d02_components_props / ex8 - undefined, null, and a callback that may not exist.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 8".

export function NoticeBar({
  message,
  footer,
  onDismiss,
}: {
  message: string;
  footer?: string | null;
  onDismiss?: () => void;
}) {
  return (
    <div>
      <p>{message}</p>
      <p>{footer || "Nothing to do"}</p>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}
