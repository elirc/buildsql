// 06_effects / review1 - cleanup runs before the next effect, with old values.
// See tracks/react/lessons/06_effects/README.md, "Review".

export function AnnounceOnChange({
  message,
  onAnnounce,
  onClear,
}: {
  message: string;
  onAnnounce: (message: string) => void;
  onClear: (message: string) => void;
}) {
  return <p role="status">{message}</p>;
}
