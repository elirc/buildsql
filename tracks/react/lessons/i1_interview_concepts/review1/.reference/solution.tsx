// i1_interview_concepts / review1 - reference solution.
import { useEffect } from "react";

export function ShortcutListener({ onSave }: { onSave: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "s") {
        onSave();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSave]);

  return <p>Press s to save</p>;
}
