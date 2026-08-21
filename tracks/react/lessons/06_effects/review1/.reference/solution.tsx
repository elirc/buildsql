// 06_effects / review1 - reference solution.
import { useEffect } from "react";

export function AnnounceOnChange({
  message,
  onAnnounce,
  onClear,
}: {
  message: string;
  onAnnounce: (message: string) => void;
  onClear: (message: string) => void;
}) {
  useEffect(() => {
    onAnnounce(message);
    return () => {
      onClear(message);
    };
  }, [message, onAnnounce, onClear]);

  return <p role="status">{message}</p>;
}
